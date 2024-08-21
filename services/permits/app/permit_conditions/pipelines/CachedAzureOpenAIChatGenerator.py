import hashlib
import logging
import os
import pickle
import struct

from app.permit_conditions.pipelines.chat_data import ChatData
from haystack import component
from haystack.components.generators.chat import AzureOpenAIChatGenerator
from haystack.dataclasses import ChatMessage

ROOT_DIR = os.path.abspath(os.curdir)
logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "False").lower() == "true"
AZURE_DEPLOYMENT_NAME = os.environ.get("AZURE_DEPLOYMENT_NAME")

def hash_messages(messages):
    """
    Calculates the SHA256 hash digest of a list of messages.

    Args:
        messages (list): A list of messages.

    Returns:
        str: The SHA256 hash digest of the messages.
    """

    to_hash = messages + [ChatMessage.from_user(AZURE_DEPLOYMENT_NAME)]

    hsh = hashlib.sha256()
    for message in to_hash:
        hsh.update(struct.pack("I", len(message.content)))
        hsh.update(message.content.encode())

    return hsh.hexdigest()


@component
class CachedAzureOpenAIChatGenerator(AzureOpenAIChatGenerator):

    def __init__(self, **kwargs):
        super(CachedAzureOpenAIChatGenerator, self).__init__(**kwargs)
        self.it = 0
    """
    A class that represents a cached version of the AzureOpenAIChatGenerator.

    This class extends the AzureOpenAIChatGenerator class and adds caching functionality to the chat generation process.
    It fetches the result from the cache if available, otherwise it queries the OpenAI API and caches the result for future use.

    Note: This currently only caches responses locally on the filesystem and should only be used locally.
    """

    def fetch_result(self, messages, generation_kwargs):
        """
        Fetches the chat generation result from the cache or queries the OpenAI API.

        Args:
            messages (list): A list of chat messages.
            generation_kwargs (dict): Additional generation parameters.

        Returns:
            dict: The chat generation result.
        """
        cache_key = hash_messages(messages)

        if DEBUG_MODE:
            try:
                with open(f"app/cache/{cache_key}.pickle", "rb") as f:
                    res = {
                        **pickle.load(f),
                    }
            except:
                logger.info("No cache entry found. Quering OpenAI")
                res = None
        else:
            res = None

        if not res:
            try:
                res = super(CachedAzureOpenAIChatGenerator, self).run(
                    messages=messages, generation_kwargs=generation_kwargs
                )
            except Exception as e:
                logger.error(f"Error while querying OpenAI: {e}")
                raise

            if DEBUG_MODE:
                with open(f"app/cache/{cache_key}.pickle", "wb") as f:
                    pickle.dump(res, f, protocol=pickle.HIGHEST_PROTOCOL)

        return res["replies"][0]

    @component.output_types(data=ChatData)
    def run(self, data: ChatData, generation_kwargs=None, iteration=0):
        self.it+=1
        """
        Runs the chat generation process.

        Args:
            data (ChatData): The input chat data.
            generation_kwargs (dict, optional): Additional generation parameters.
            iteration (int, optional): The current iteration count.

        Returns:
            dict: The output chat data.
        """
        reply = self.fetch_result(data.messages, generation_kwargs)

        content = reply.content
        completion_tokens = reply.meta["usage"]["completion_tokens"]
        prompt_tokens = reply.meta["usage"]["prompt_tokens"]
        total_tokens = reply.meta["usage"]["total_tokens"]

        # If the response is too long for GPT4 to complete (returned tokens > 4096), ask GPT4 to continue the query
        # limit the number of iterations to 10 to avoid issues if GPT4 for some reason
        # keeps returning partial responses
        while reply.meta["finish_reason"] == "length" and iteration < 10:
            logger.info(
                f"Partial json generated continuing query. Iteration: {iteration}"
            )

            messages = data.messages + [reply, ChatMessage.from_user("Your response got cut off. Continue from where you left off.")]
            reply = self.fetch_result(messages, generation_kwargs)
            content += reply.content

            # Sum up the usage tokens to make this continuation process transparent to the other components
            completion_tokens += reply.meta["usage"]["completion_tokens"]
            prompt_tokens += reply.meta["usage"]["prompt_tokens"]
            total_tokens += reply.meta["usage"]["total_tokens"]

            iteration += 1
            if DEBUG_MODE:
                with open(f"debug/cached_azure_openai_chat_generator_output_{self.it}_{iteration}.txt", "w") as f:
                    f.write(reply.content)

        reply.content = content
        reply.meta["usage"]["completion_tokens"] = completion_tokens
        reply.meta["usage"]["prompt_tokens"] = prompt_tokens
        reply.meta["usage"]["total_tokens"] = total_tokens

        if DEBUG_MODE:
            with open(f"debug/cached_azure_openai_chat_generator_output_{self.it}.txt", "w") as f:
                f.write(reply.content)

        return {"data": ChatData([reply], data.documents)}

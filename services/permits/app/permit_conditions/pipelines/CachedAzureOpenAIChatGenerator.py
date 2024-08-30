import hashlib
import logging
import os
import pickle
import struct

from app.permit_conditions.pipelines.chat_data import ChatData
from haystack import component, Document
from haystack.components.generators.chat import AzureOpenAIChatGenerator
from haystack.dataclasses import ChatMessage

from app.permit_conditions.pipelines.response_data import ResponseData
from haystack.components.caching import CacheChecker
from haystack_integrations.document_stores.elasticsearch import ElasticsearchDocumentStore
from haystack.components.writers import DocumentWriter

ROOT_DIR = os.path.abspath(os.curdir)
logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "False").lower() == "true"
ca_cert = os.environ.get("ELASTICSEARCH_CA_CERT", None)
host = os.environ.get("ELASTICSEARCH_HOST", "https://elasticsearch:9200")
username = os.environ.get("ELASTICSEARCH_USERNAME", "")
password = os.environ.get("ELASTICSEARCH_PASSWORD", "")


def hash_messages(messages):
    """
    Calculates the SHA256 hash digest of a list of messages.

    Args:
        messages (list): A list of messages.

    Returns:
        str: The SHA256 hash digest of the messages.
    """
    hash = hashlib.sha256()
    for message in messages:
        hash.update(struct.pack("I", len(message.content)))
        hash.update(message.content.encode())

    return hash.hexdigest()


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
        res = None
        existing_reply_found = False
        cache_key = hash_messages(messages)

        document_store = ElasticsearchDocumentStore(hosts=[host],
                                                    basic_auth=("elastic", "elastic"),
                                                    index="permits",
                                                    embedding_similarity_function="cosine",
                                                    ca_certs=ca_cert if ca_cert else None,
                                                    verify_certs=True if ca_cert else False)

        cache_checker = CacheChecker(document_store=document_store, cache_field="cache_key")
        cached_result = cache_checker.run(items=[cache_key])
        if len(cached_result["hits"]) > 0:
            existing_reply_found = True
            print("cached_result", cached_result)
            res = {"replies": [ChatMessage(content=cached_result["hits"][0].content,
                                           name=cached_result["hits"][0].meta["name"],
                                           role=cached_result["hits"][0].meta["role"],
                                           meta=cached_result["hits"][0].meta)]}

        if not existing_reply_found:
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
                    # Check if cache contains reply, then respond based on that.
                    #  if not, store the
                    res = super(CachedAzureOpenAIChatGenerator, self).run(
                        messages=messages, generation_kwargs=generation_kwargs
                    )
                except Exception as e:
                    logger.error(f"Error while querying OpenAI: {e}")
                    raise

                if DEBUG_MODE:
                    with open(f"app/cache/{cache_key}.pickle", "wb") as f:
                        pickle.dump(res, f, protocol=pickle.HIGHEST_PROTOCOL)

            documents = [
                Document(content=res["replies"][0].content, meta={"cache_key": cache_key,
                                                                  "name": res["replies"][0].name,
                                                                  "role": res["replies"][0].role,
                                                                  "model": res["replies"][0].meta["model"],
                                                                  "index": res["replies"][0].meta["index"],
                                                                  "finish_reason": res["replies"][0].meta["finish_reason"],            #
                                                                  "usage": {"completion_tokens": res["replies"][0].meta["usage"]["completion_tokens"],
                                                                            "prompt_tokens": res["replies"][0].meta["usage"]["prompt_tokens"],
                                                                            "total_tokens": res["replies"][0].meta["usage"]["total_tokens"]}
                                                                  })
            ]
            document_store.write_documents(documents)
            # print("CACHED DOCUMENTS:", documents)
        print("RES_REPLIES MODEL:", res["replies"][0])
        print("RES_REPLIES NAME:", res["replies"][0].name)
        print("RES_REPLIES ROLE:", res["replies"][0].role)
        print("RES_REPLIES MODEL:", res["replies"][0].meta["model"])
        # print("RES_REPLIES STOP:", res["replies"][0].meta["stop"])
        return res["replies"][0]

    @component.output_types(data=ChatData)
    def run(self, data: ChatData, generation_kwargs=None, iteration=0):
        self.it += 1
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

            messages = data.messages + [reply, ChatMessage.from_user("Continue!")]
            reply = self.fetch_result(messages, generation_kwargs)

            content += reply.content

            # Sum up the usage tokens to make this continuation process transparent to the other components
            completion_tokens += reply.meta["usage"]["completion_tokens"]
            prompt_tokens += reply.meta["usage"]["prompt_tokens"]
            total_tokens += reply.meta["usage"]["total_tokens"]

            iteration += 1

        reply.content = content
        reply.meta["usage"]["completion_tokens"] = completion_tokens
        reply.meta["usage"]["prompt_tokens"] = prompt_tokens
        reply.meta["usage"]["total_tokens"] = total_tokens

        if DEBUG_MODE:
            with open(f"debug/cached_azure_openai_chat_generator_output_{iteration}.txt", "w") as f:
                f.write(reply.content)

        return {"data": ChatData([reply], data.documents)}

import concurrent.futures
import hashlib
import logging
import os
import struct
from typing import List, Optional

from app.permit_conditions.pipelines.chat_data import ChatData
from haystack import Document, component
from haystack.components.caching import CacheChecker
from haystack.components.generators.chat import AzureOpenAIChatGenerator
from haystack.dataclasses import ChatMessage
from haystack.document_stores.types import DuplicatePolicy
from haystack_integrations.document_stores.elasticsearch import (
    ElasticsearchDocumentStore,
)

ROOT_DIR = os.path.abspath(os.curdir)
logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "False").lower() == "true"
AZURE_DEPLOYMENT_NAME = os.environ.get("AZURE_DEPLOYMENT_NAME")

if not AZURE_DEPLOYMENT_NAME:
    raise ValueError("AZURE_DEPLOYMENT_NAME environment variable is not set.")

ca_cert = os.environ.get("ELASTICSEARCH_CA_CERT", None)
host = os.environ.get("ELASTICSEARCH_HOST", None) or "https://elasticsearch:9200"
username = os.environ.get("ELASTICSEARCH_USERNAME", "")
password = os.environ.get("ELASTICSEARCH_PASSWORD", "")

MAX_WORKERS = 5


def hash_messages(messages):
    """
    Calculates the SHA256 hash digest of a list of messages.

    Args:
        messages (list): A list of messages.

    Returns:
        str: The SHA256 hash digest of the messages.
    """

    to_hash = messages + [ChatMessage.from_user(AZURE_DEPLOYMENT_NAME or "")]

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

    def fetch_result(self, messages: List[ChatMessage], generation_kwargs):
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

        document_store = ElasticsearchDocumentStore(hosts=host,
                                                    basic_auth=(username, password),
                                                    index="permits",
                                                    embedding_similarity_function="cosine",
                                                    ca_certs=ca_cert if ca_cert else None,
                                                    verify_certs=True if ca_cert else False)

        cache_checker = CacheChecker(document_store=document_store, cache_field="cache_key")
        cached_result = cache_checker.run(items=[cache_key])
        if len(cached_result["hits"]) > 0:
            existing_reply_found = True
            logger.info("cached_result: %s", cached_result)
            res = {"replies": [ChatMessage(content=cached_result["hits"][0].content,
                                           name=cached_result["hits"][0].meta["name"],
                                           role=cached_result["hits"][0].meta["role"],
                                           meta=cached_result["hits"][0].meta)]}
            return res["replies"][0]
        if not existing_reply_found:
            try:
                res = super(CachedAzureOpenAIChatGenerator, self).run(
                    messages=messages, generation_kwargs=generation_kwargs
                )

                documents = [
                Document(content=res["replies"][0].content, meta={"cache_key": cache_key,
                                                                "name": res["replies"][0].name,
                                                                "role": res["replies"][0].role,
                                                                "model": res["replies"][0].meta["model"],
                                                                "index": res["replies"][0].meta["index"],
                                                                "finish_reason": res["replies"][0].meta[
                                                                    "finish_reason"],  #
                                                                "usage": {"completion_tokens":
                                                                                res["replies"][0].meta["usage"][
                                                                                    "completion_tokens"],
                                                                            "prompt_tokens":
                                                                                res["replies"][0].meta["usage"][
                                                                                    "prompt_tokens"],
                                                                            "total_tokens":
                                                                                res["replies"][0].meta["usage"][
                                                                                    "total_tokens"]}
                                                                })
                ]
                document_store.write_documents(documents, policy=DuplicatePolicy.OVERWRITE)
                return res["replies"][0]

            except Exception as e:
                logger.error(f"Error while querying OpenAI: {e}")
                raise


    @component.output_types(data=ChatData)
    def run(self, data: ChatData, generation_kwargs=None, iteration=0):
        self.it += 1
        """
        Runs the chat generation process in parallel with max 3 concurrent executions.

        Args:
            data (ChatData): The input chat data.
            generation_kwargs (dict, optional): Additional generation parameters.
            iteration (int, optional): The current iteration count.

        Returns:
            dict: The output chat data.
        """
        results: List[List[ChatMessage]] = [[] for _ in range(len(data.messages))]

        def process_message(args):
            idx, messages = args
            return idx, self.run_for_message(messages, generation_kwargs, idx + self.it)

        with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = [executor.submit(process_message, (idx, messages)) 
                  for idx, messages in enumerate(data.messages)]
            
            for future in concurrent.futures.as_completed(futures):
                idx, result = future.result()
                if result is not None:
                    results[idx].append(result)

        if DEBUG_MODE:
            with open(
                    f"debug/cached_azure_openai_chat_generator_output.txt", "w"
            ) as f:
                for reply in results:
                    for r in reply:
                        f.write(r.content)
                        f.write("\n")

        return {"data": ChatData(messages=results, documents=data.documents)}


    def run_for_message(self, messages: List[ChatMessage], generation_kwargs=None, iteration=0) -> Optional[ChatMessage]:
    
        reply = self.fetch_result(messages, generation_kwargs)


        if reply is None:
            return None
        
        with open(
                f"debug/cached_azure_openai_chat_generator_output_{iteration}.txt",
                "w",
        ) as f:
            f.write(reply.content)

        content = reply.content
        completion_tokens = reply.meta["usage"]["completion_tokens"]
        prompt_tokens = reply.meta["usage"]["prompt_tokens"]
        total_tokens = reply.meta["usage"]["total_tokens"]

        # If the response is too long for GPT4 to complete (returned tokens > 4096), ask GPT4 to continue the query
        # limit the number of iterations to 10 to avoid issues if GPT4 for some reason
        # keeps returning partial responses

        lp = 0
        while reply is not None and reply.meta["finish_reason"] == "length" and iteration < 10:
            lp += 1
            logger.info(
                f"Partial json generated continuing query. Iteration: {iteration}"
            )

            messages = messages + [
                reply,
                ChatMessage.from_user(
                    "Your response got cut off. Continue from where you left off."
                ),
            ]
            reply = self.fetch_result(messages, generation_kwargs)

            if reply is None:
                reply = None
                continue
            content += reply.content

            # Sum up the usage tokens to make this continuation process transparent to the other components
            completion_tokens += reply.meta["usage"]["completion_tokens"]
            prompt_tokens += reply.meta["usage"]["prompt_tokens"]
            total_tokens += reply.meta["usage"]["total_tokens"]

            iteration += 1
            if DEBUG_MODE:
                with open(
                        f"debug/cached_azure_openai_chat_generator_output_{iteration}_{lp}.txt",
                        "w",
                ) as f:
                    f.write(reply.content)
        
        if reply is None:
            reply = ChatMessage(content=content, role=messages[0].role, name=messages[0].name)

        reply.content = content
        reply.meta["usage"]["completion_tokens"] = completion_tokens
        reply.meta["usage"]["prompt_tokens"] = prompt_tokens
        reply.meta["usage"]["total_tokens"] = total_tokens

        return reply

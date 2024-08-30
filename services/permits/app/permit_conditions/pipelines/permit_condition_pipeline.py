import logging
import os

import yaml
from app.permit_conditions.converters.pdf_to_text_converter import PDFToTextConverter
from app.permit_conditions.pipelines.CachedAzureOpenAIChatGenerator import (
    CachedAzureOpenAIChatGenerator,
)
from app.permit_conditions.pipelines.CachedDocumentBuilder import CachedDocumentBuilder
from app.permit_conditions.pipelines.PaginatedChatPromptBuilder import (
    PaginatedChatPromptBuilder,
)
from app.permit_conditions.validator.json_fixer import JSONRepair
from app.permit_conditions.validator.permit_condition_validator import (
    PermitConditionValidator,
)
from haystack import Pipeline
from haystack.dataclasses import ChatMessage
from haystack.utils import Secret
from haystack.components.caching import CacheChecker
from haystack_integrations.document_stores.elasticsearch import ElasticsearchDocumentStore
from haystack.components.writers import DocumentWriter

logger = logging.getLogger(__name__)

ROOT_DIR = os.path.abspath(os.curdir)

api_key = os.environ.get("AZURE_API_KEY")
deployment_name = os.environ.get("AZURE_DEPLOYMENT_NAME")
base_url = os.environ.get("AZURE_BASE_URL")
api_version = os.environ.get("AZURE_API_VERSION")

assert api_key
assert deployment_name
assert base_url
assert api_version

with open(f"{ROOT_DIR}/app/permit_condition_prompts.yaml", "r") as file:
    prompts = yaml.safe_load(file)

system_prompt = prompts["system_prompt"]
user_prompt = prompts["user_prompt"]
permit_document_prompt = prompts["permit_document_prompt"]

assert system_prompt
assert user_prompt
assert permit_document_prompt

ca_cert = os.environ.get("ELASTICSEARCH_CA_CERT", None)
host = os.environ.get("ELASTICSEARCH_HOST", "https://elasticsearch:9200")
username = os.environ.get("ELASTICSEARCH_USERNAME", "")
password = os.environ.get("ELASTICSEARCH_PASSWORD", "")


def permit_condition_pipeline():
    """
    This function creates and returns a pipeline for extracting permit conditions.

    Returns:
        Pipeline: The pipeline object for extracting permit conditions.
    """
    index_pipeline = Pipeline()

    # document_store = ElasticsearchDocumentStore(hosts=[host],
    #                                             basic_auth=("elastic", "elastic"),
    #                                             index="permits",
    #                                             embedding_similarity_function="cosine",
    #                                             ca_certs=ca_cert if ca_cert else None,
    #                                             verify_certs=True if ca_cert else False)
    #
    # cache_checker = CacheChecker(document_store=document_store, cache_field="cache_key")
    # document_writer = DocumentWriter(document_store=document_store)
    # cached_document_builder = CachedDocumentBuilder()

    llm = CachedAzureOpenAIChatGenerator(
        azure_endpoint=base_url,
        api_version=api_version,
        azure_deployment=deployment_name,
        api_key=Secret.from_token(api_key),
        timeout=600,
        generation_kwargs={"temperature": 0, "max_tokens": 4096},
    )

    pdf_converter = PDFToTextConverter()
    prompt_builder = PaginatedChatPromptBuilder(
        template=[
            ChatMessage.from_system(system_prompt),
            ChatMessage.from_user(user_prompt),
            ChatMessage.from_user(permit_document_prompt),
        ]
    )

    json_fixer = JSONRepair()

    validator = PermitConditionValidator()

    # index_pipeline.add_component("cache_checker", cache_checker)
    # index_pipeline.add_component("document_writer", document_writer)
    # index_pipeline.add_component("cached_document_builder", cached_document_builder)
    index_pipeline.add_component("pdf_converter", pdf_converter)
    index_pipeline.add_component("prompt_builder", prompt_builder)
    index_pipeline.add_component("llm", llm)
    index_pipeline.add_component("json_fixer", json_fixer)
    index_pipeline.add_component("validator", validator)

    index_pipeline.connect("pdf_converter", "prompt_builder")
    index_pipeline.connect("prompt_builder", "llm")
    index_pipeline.connect("llm", "json_fixer")
    index_pipeline.connect("json_fixer", "validator")
    index_pipeline.connect("validator.iteration", "prompt_builder.iteration")
    # index_pipeline.connect("llm.response", "cached_document_builder")
    # index_pipeline.connect("cached_document_builder", "document_writer")
    # print("document_store_filter", document_store.count_documents())
    return index_pipeline

import logging
import os
import re

import yaml
from app.pipelines.document_search.config import config
from app.pipelines.document_search.search_index_fields import fields
from app.pipelines.permit_condition_search.components.azure_blob_upload import AzureBlobUploader
from app.pipelines.permit_condition_search.components.indexer_runner import IndexerRunner
from app.pipelines.permit_condition_search.stores.ai_search_document_store import (
    AdditionalAISearchConfig,
    AzureSearchDocumentStore,
)
from azure.search.documents.indexes.models import VectorSearch
from haystack import AsyncPipeline, Pipeline
from haystack.components.builders import ChatPromptBuilder
from haystack.components.embedders import AzureOpenAITextEmbedder
from haystack.components.extractors.llm_metadata_extractor import AzureOpenAIChatGenerator
from haystack.dataclasses import ChatMessage
from haystack_integrations.components.retrievers.azure_ai_search import AzureAISearchHybridRetriever

logger = logging.getLogger(__name__)

ROOT_DIR = os.path.abspath(os.curdir)

with open(f"{ROOT_DIR}/app/now_application_search_prompts.yaml", "r") as file:
    prompts = yaml.safe_load(file)

doc_metadata_fields = {f.name: f for f in fields}
vector_search_config = VectorSearch()

# Default facets exposed to the search UI for NoW document results.
NOW_DOCUMENT_SEARCH_FACETS = [
    "document_name",
    "document_type",
    "submitted_date",
]


def create_now_document_search_store() -> AzureSearchDocumentStore:
    return AzureSearchDocumentStore(
        index_fields=fields,
        api_key=config.search.api_key,
        azure_endpoint=config.search.endpoint,
        index_name=config.search.index_name.resolve_value(),
        embedding_dimension=config.search.embedding_dimension,
        metadata_fields=doc_metadata_fields,
        vector_search_configuration=vector_search_config,
        semantic_configuration_name="now-document-semantic-config",
        search_config=AdditionalAISearchConfig(
            highlight_fields="content",
            highlight_pre_tag="**",
            highlight_post_tag="**",
        ),
    )


def create_document_search_indexing_pipeline() -> Pipeline:
    """
    Indexing pipeline: uploads a CSV to Azure Blob Storage then triggers the
    Azure Search indexer to process it and generate embeddings.
    """
    pipeline = Pipeline()

    # Extract account name from connection string to satisfy proxy requirements
    account_name_match = re.search(r"AccountName=([^;]+)", config.storage.connection_string)
    account_name = account_name_match.group(1) if account_name_match else ""
    
    blob_endpoint = config.storage.blob_service_endpoint
    if blob_endpoint and account_name and account_name not in blob_endpoint:
        blob_endpoint = f"{blob_endpoint.rstrip('/')}/{account_name}"

    blob_uploader = AzureBlobUploader(
        connection_string=config.storage.connection_string,
        container_name=config.storage.container_name,
        blob_service_endpoint=blob_endpoint,
        folder_name="indexing/now",
    )

    api_key = config.search.api_key.resolve_value()
    assert api_key, "Search API key must be set"
    search_endpoint = config.search.endpoint.resolve_value()
    assert search_endpoint, "Search endpoint must be set"

    indexer_runner = IndexerRunner(
        search_endpoint=search_endpoint,
        search_api_key=api_key,
        indexer_name=config.search.indexer_name.resolve_value(),
        wait_for_completion=False,
    )

    pipeline.add_component("blob_uploader", blob_uploader)
    pipeline.add_component("indexer_runner", indexer_runner)
    pipeline.connect("blob_uploader.blob_url", "indexer_runner.blob_url")

    return pipeline


def create_document_search_retrieval_pipeline() -> AsyncPipeline:
    """
    RAG retrieval pipeline for NoW application document search.

    Intentionally simpler than the permit conditions pipeline — no ContextEnricher,
    because NoW documents are unstructured and don't carry parent/sibling relationships.

    The now_application_guid filter is always injected by the API layer before this
    pipeline is invoked, ensuring results are scoped to a single application.
    """
    pipeline = AsyncPipeline()

    document_store = create_now_document_search_store()

    text_embedder = AzureOpenAITextEmbedder(
        azure_endpoint=config.openai.endpoint.resolve_value(),
        azure_deployment=config.openai.embedding_model,
        api_key=config.openai.api_key,
    )

    retriever = AzureAISearchHybridRetriever(
        top_k=20,
        document_store=document_store,
        facets=NOW_DOCUMENT_SEARCH_FACETS,
    )

    search_template = prompts.get("now_document_search_prompt")
    prompt_builder = ChatPromptBuilder(template=[
        ChatMessage.from_system(search_template.get("system")),
        ChatMessage.from_user(search_template.get("user")),
    ])

    llm = AzureOpenAIChatGenerator(
        azure_endpoint=config.openai.endpoint.resolve_value(),
        azure_deployment=config.openai.deployment_name,
        api_key=config.openai.api_key,
        api_version=config.openai.api_version,
        generation_kwargs={"temperature": 0, "max_tokens": 8192, "n": 1},
    )

    pipeline.add_component("text_embedder", text_embedder)
    pipeline.add_component("retriever", retriever)
    pipeline.add_component("prompt_builder", prompt_builder)
    pipeline.add_component("llm", llm)

    pipeline.connect("text_embedder.embedding", "retriever.query_embedding")
    pipeline.connect("retriever.documents", "prompt_builder.documents")
    pipeline.connect("prompt_builder", "llm")

    logger.info("NoW document search retrieval pipeline created successfully")
    return pipeline


logger.info("Initializing NoW document search pipelines")
if not os.getenv("TESTING"):
    now_document_search_retrieval_pipeline = create_document_search_retrieval_pipeline()
    now_document_search_indexing_pipeline = create_document_search_indexing_pipeline()
    logger.info("NoW document search pipelines initialized successfully")
else:
    now_document_search_retrieval_pipeline = None
    now_document_search_indexing_pipeline = None
    logger.info("NoW document search pipeline initialization skipped for testing")

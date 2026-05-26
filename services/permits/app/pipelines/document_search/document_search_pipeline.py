import logging
import os

import yaml
from app.pipelines.document_search.config import config
from app.pipelines.document_search.search_index_fields import fields
from app.pipelines.permit_condition_search.stores.ai_search_document_store import (
    AdditionalAISearchConfig,
    AzureSearchDocumentStore,
)
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes.models import VectorSearch
from haystack import AsyncPipeline
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
    "artifact_type",
    "artifact_page_number",
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
        headers={"Authorization": f"Bearer {config.search.api_key.resolve_value()}"},
    )


def create_now_document_search_client() -> SearchClient:
    """
    Returns an Azure SearchClient pointed at the NoW document index.
    Used by the indexing endpoint to push chunks directly to the index,
    bypassing the blob-storage + indexer pull approach.
    """
    return SearchClient(
        endpoint=config.search.endpoint.resolve_value(),
        index_name=config.search.index_name.resolve_value(),
        credential=AzureKeyCredential(config.search.api_key.resolve_value()),
        headers={"Authorization": f"Bearer {config.search.api_key.resolve_value()}"},
    )


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
        default_headers={"Authorization": f"Bearer {config.openai.api_key.resolve_value()}"},
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
        default_headers={"Authorization": f"Bearer {config.openai.api_key.resolve_value()}"},
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
    now_document_search_search_client = create_now_document_search_client()
    logger.info("NoW document search pipelines initialized successfully")
else:
    now_document_search_retrieval_pipeline = None
    now_document_search_search_client = None
    logger.info("NoW document search pipeline initialization skipped for testing")

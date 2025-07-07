import logging
import os
from datetime import datetime
from typing import List

import yaml
from app.pipelines.permit_condition_search.components.azure_blob_upload import (
    AzureBlobUploader,
)
from app.pipelines.permit_condition_search.components.context_enricher import (
    ContextEnricher,
)
from app.pipelines.permit_condition_search.components.indexer_runner import (
    IndexerRunner,
)
from app.pipelines.permit_condition_search.config import config
from app.pipelines.permit_condition_search.search_index_fields import fields
from app.pipelines.permit_condition_search.stores.ai_search_document_store import (
    AdditionalAISearchConfig,
    AzureSearchDocumentStore,
)
from azure.search.documents.indexes.models import VectorSearch
from haystack import AsyncPipeline, Pipeline
from haystack.components.builders import ChatPromptBuilder, PromptBuilder
from haystack.components.embedders import AzureOpenAITextEmbedder
from haystack.components.extractors.llm_metadata_extractor import (
    AzureOpenAIChatGenerator,
)
from haystack.components.generators import AzureOpenAIGenerator
from haystack.dataclasses import ChatMessage
from haystack_integrations.components.retrievers.azure_ai_search import (
    AzureAISearchHybridRetriever,
)
from haystack_integrations.document_stores.elasticsearch import (
    ElasticsearchDocumentStore,
)

logger = logging.getLogger(__name__)


ROOT_DIR = os.path.abspath(os.curdir)

with open(f"{ROOT_DIR}/app/permit_condition_prompts.yaml", "r") as file:
    prompts = yaml.safe_load(file)

# Metadata field definitions for search index
doc_metadata_fields = {
    "category": str,
    "issue_date": datetime,
    "permit": str,
    "permit_type": str,
    "mine_number": str,
    "mine_name": str,
    "document_name": str,
    "document_manager_guid": str,
    "mine_guid": str,
    "permit_guid": str,
    "permit_condition_guid": str,
    "permit_amendment_guid": str,
    "step": str,
    "step_path": str,
    "parent_ids": List[str],  # Changed from parent_id to parent_ids
    "sibling_ids": List[str],  # Add sibling_ids
    "child_ids": List[str],  # Add child_ids
    "report_name": str,  # Add report_name field
    "tenure": List[str],
    "verification_status": str,
}

doc_metadata_fields = { f.name: f for f in fields }

vector_search_config = VectorSearch()


def create_azure_search_document_store():
    return AzureSearchDocumentStore(
        api_key=config.search.api_key,
        azure_endpoint=config.search.endpoint,
        index_name=config.search.index_name,
        embedding_dimension=config.search.embedding_dimension,
        metadata_fields=doc_metadata_fields,
        vector_search_configuration=vector_search_config,
        semantic_configuration_name="permit-semantic-config",
        search_config=AdditionalAISearchConfig(
            highlight_fields="content",
            highlight_pre_tag="**",
            highlight_post_tag="**",
        ),
    )


def create_elasticsearch_document_store():
    return ElasticsearchDocumentStore(
        hosts=config.elasticsearch.host,
        basic_auth=(config.elasticsearch.username, config.elasticsearch.password),
        index=config.elasticsearch.index_name,
        embedding_similarity_function="cosine",
        ca_certs=config.elasticsearch.ca_cert if config.elasticsearch.ca_cert else None,
        verify_certs=bool(config.elasticsearch.ca_cert),
    )


def create_permit_condition_search_indexing_pipeline():
    """
    Creates a pipeline for indexing permit conditions by uploading to blob storage and running the indexer
    """
    index_pipeline = Pipeline()

    blob_uploader = AzureBlobUploader(
        connection_string=config.storage.connection_string,
        container_name=config.storage.container_name,
    )

    api_key = config.search.api_key.resolve_value()

    assert api_key is not None, "API key must be provided to create the indexer"

    indexer_runner = IndexerRunner(
        search_endpoint=config.search.endpoint,
        search_api_key=api_key,
    )

    index_pipeline.add_component("blob_uploader", blob_uploader)
    index_pipeline.add_component("indexer_runner", indexer_runner)

    index_pipeline.connect("blob_uploader.blob_url", "indexer_runner.blob_url")

    return index_pipeline


def create_permit_condition_search_retrieval_pipeline():
    """
    Creates a RAG pipeline for retrieving permit conditions using AsyncPipeline for concurrent execution.
    Simplified version without streamer components, using AsyncPipeline's generator feature.
    """
    retrieval_pipeline = AsyncPipeline()
    try:
        azure_search_document_store = create_azure_search_document_store()
    except Exception as e:
        print(f"Error initializing document store: {str(e)}")
        raise

    logger.info("Adding components to pipeline")
    text_embedder = AzureOpenAITextEmbedder(
        azure_endpoint=config.openai.endpoint.resolve_value(),
        azure_deployment=config.openai.embedding_model,
        api_key=config.openai.api_key,
    )

    retriever = AzureAISearchHybridRetriever(
        top_k=35,
        document_store=azure_search_document_store,
        facets=[
            "category",
            "issue_date",
            "permit",
            "mine_number",
            "mine_name",
            "document_name",
            "permit_type",
            "tenure",
            "verification_status",
        ],
    )

    context_enricher = ContextEnricher(document_store=azure_search_document_store)

    search_template = prompts.get("permit_condition_search_prompt")
    prompt_builder = ChatPromptBuilder(template=[
        ChatMessage.from_system(search_template.get("system")),
        ChatMessage.from_user(search_template.get("user")),
    ])

    llm = AzureOpenAIChatGenerator(
        azure_endpoint=config.openai.endpoint.resolve_value(),
        azure_deployment=config.openai.deployment_name,
        api_key=config.openai.api_key,
        api_version=config.openai.api_version,
        generation_kwargs={"temperature": 0, "max_tokens": 16384, "n": 1},
    )

    retrieval_pipeline.add_component("text_embedder", text_embedder)
    retrieval_pipeline.add_component("retriever", retriever)
    retrieval_pipeline.add_component("context_enricher", context_enricher)
    retrieval_pipeline.add_component("prompt_builder", prompt_builder)
    retrieval_pipeline.add_component("llm", llm)

    logger.info("Connecting pipeline components")

    retrieval_pipeline.connect("text_embedder.embedding", "retriever.query_embedding")
    retrieval_pipeline.connect("retriever", "context_enricher")
    retrieval_pipeline.connect("context_enricher", "prompt_builder.documents")
    retrieval_pipeline.connect("prompt_builder", "llm")

    try:
        retrieval_pipeline._validate_input(
            {
                "text_embedder": {"text": "test"},
                "retriever": {"query": "test", "filters": []},
                "prompt_builder": {"question": "test"},
                "llm": {"streaming_callback": lambda x: x},
            }
        )
        print("Pipeline validation successful!")
    except Exception as e:
        print(f"Pipeline validation failed: {str(e)}")
        raise

    logger.info("Permit condition search retrieval pipeline created successfully")
    return retrieval_pipeline


logger.info("Initializing permit condition search pipelines")
if not os.getenv("TESTING"):
    permit_condition_search_retrieval_pipeline = create_permit_condition_search_retrieval_pipeline()
    permit_condition_search_indexing_pipeline = create_permit_condition_search_indexing_pipeline()
    logger.info("Pipelines initialized successfully")
else:
    permit_condition_search_retrieval_pipeline = None
    permit_condition_search_indexing_pipeline = None
    logger.info("Pipelines initialization skipped for testing")

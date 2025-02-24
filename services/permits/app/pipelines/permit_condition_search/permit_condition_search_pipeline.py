import logging
from datetime import datetime

from app.pipelines.permit_condition_search.components.azure_blob_upload import (
    AzureBlobUploader,
)
from app.pipelines.permit_condition_search.components.indexer_runner import (
    IndexerRunner,
)
from app.pipelines.permit_condition_search.components.search_output_formatter import (
    SearchOutputFormatter,
)
from app.pipelines.permit_condition_search.config import config
from app.pipelines.permit_condition_search.create_search_index import (
    create_or_update_index,
)
from app.pipelines.permit_condition_search.create_search_indexer import (
    create_search_indexer,
)
from app.pipelines.permit_condition_search.stores.ai_search_document_store import (
    AdditionalAISearchConfig,
    AzureSearchDocumentStore,
)
from azure.search.documents.indexes.models import VectorSearch
from haystack import Pipeline
from haystack.components.builders import PromptBuilder
from haystack.components.embedders import AzureOpenAITextEmbedder
from haystack.components.generators import AzureOpenAIGenerator
from haystack_integrations.components.retrievers.azure_ai_search import (
    AzureAISearchHybridRetriever,
)
from haystack_integrations.document_stores.elasticsearch import (
    ElasticsearchDocumentStore,
)

logger = logging.getLogger(__name__)

# Initialize required infrastructure
create_or_update_index()
create_search_indexer()

# Metadata field definitions
doc_metadata_fields = {
    "category": str,
    "issue_date": datetime,
    "permit": str,
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
}

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
        )
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

template = """
    You are an expert assistant that helps users find information about permit conditions and reason about them. When answering a question or searching, you can only use the information in the sources provided. \n
    You must cite all your sources in square brackets with the prefix "doc" for example: Paris is the capital of france [doc:1].\n You must represent the information in the sources accurately and not modify the content at all. \n
    When you find a matching permit condition, you should enclose it in a Markdown blockquotes (>) to make it clear that it is a direct quote from the source. \n 
    
    You will be given a list of permit conditions (sources) with the content of the condition and ID you can use to cite the source.
    
    Sources:
    {% for document in documents %}
        ID: {{ document.id }}
        Content: {{ document.content }}
    {% endfor %}
                        
    Question: {{question}}
"""

def create_permit_condition_search_indexing_pipeline():
    """
    Creates a pipeline for indexing permit conditions by uploading to blob storage and running the indexer
    """
    index_pipeline = Pipeline()
    
    blob_uploader = AzureBlobUploader(
        connection_string=config.storage.connection_string,
        container_name=config.storage.container_name
    )
    
    indexer_runner = IndexerRunner(
        search_endpoint=config.search.endpoint,
        search_api_key=config.search.api_key.resolve_value()
    )
    
    index_pipeline.add_component("blob_uploader", blob_uploader)
    index_pipeline.add_component("indexer_runner", indexer_runner)
    
    index_pipeline.connect("blob_uploader.blob_url", "indexer_runner.blob_url")
    
    return index_pipeline

def create_permit_condition_search_retrieval_pipeline():
    """
    Creates a RAG pipeline for retrieving permit conditions
    """
    retrieval_pipeline = Pipeline()

    azure_search_document_store = create_azure_search_document_store()

    text_embedder = AzureOpenAITextEmbedder(
        azure_endpoint=config.openai.endpoint,
        azure_deployment=config.openai.embedding_model,
        api_key=config.openai.api_key
    )
    
    retriever = AzureAISearchHybridRetriever(
        document_store=azure_search_document_store,
        facets=["category", "issue_date", "permit", "mine_number", "mine_name", "document_name"],
    )
    
    prompt_builder = PromptBuilder(template=template)
    
    llm = AzureOpenAIGenerator(
        azure_endpoint=config.openai.endpoint,
        azure_deployment=config.openai.deployment_name,
        api_key=config.openai.api_key,
        api_version=config.openai.api_version,
        generation_kwargs={"temperature": 0, "max_tokens": 16384, "n": 1},
    )
    
    output_formatter = SearchOutputFormatter()

    retrieval_pipeline.add_component("text_embedder", text_embedder)
    retrieval_pipeline.add_component("retriever", retriever)
    retrieval_pipeline.add_component("prompt_builder", prompt_builder)
    retrieval_pipeline.add_component("llm", llm)
    retrieval_pipeline.add_component("output_formatter", output_formatter)

    retrieval_pipeline.connect("text_embedder.embedding", "retriever.query_embedding")
    retrieval_pipeline.connect("retriever", "prompt_builder.documents")
    retrieval_pipeline.connect("prompt_builder", "llm")
    retrieval_pipeline.connect("retriever.documents", "output_formatter.documents")
    retrieval_pipeline.connect("llm.replies", "output_formatter.replies")

    return retrieval_pipeline

permit_condition_search_retrieval_pipeline = create_permit_condition_search_retrieval_pipeline()
permit_condition_search_indexing_pipeline = create_permit_condition_search_indexing_pipeline()
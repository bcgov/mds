import logging
import os
from datetime import datetime

from app.pipelines.permit_condition_search.components.cached_embedding import (
    EmbeddingCache,
)
from app.pipelines.permit_condition_search.components.csv_to_document_converter import (
    CSVToDocument,
)
from app.pipelines.permit_condition_search.components.document_embedder_with_cache import (
    DocumentEmbedderCache,
)
from app.pipelines.permit_condition_search.components.search_output_formatter import (
    SearchOutputFormatter,
)
from app.pipelines.permit_condition_search.stores.ai_search_document_store import (
    AzureSearchDocumentStore,
)
from azure.search.documents.indexes.models import VectorSearch
from haystack import Pipeline
from haystack.components.builders import ChatPromptBuilder
from haystack.components.embedders import AzureOpenAITextEmbedder
from haystack.components.generators.chat import AzureOpenAIChatGenerator
from haystack.components.joiners import DocumentJoiner
from haystack.components.writers import DocumentWriter
from haystack.dataclasses import ChatMessage
from haystack.document_stores.types import DuplicatePolicy
from haystack.utils import Secret
from haystack_integrations.components.retrievers.azure_ai_search import (
    AzureAISearchHybridRetriever,
)
from haystack_integrations.document_stores.elasticsearch import (
    ElasticsearchDocumentStore,
)

logger = logging.getLogger(__name__)

ROOT_DIR = os.path.abspath(os.curdir)

api_key = Secret.from_env_var("AZURE_API_KEY", strict=True)
deployment_name = os.environ.get("AZURE_DEPLOYMENT_NAME")
base_url = os.environ.get("AZURE_BASE_URL")
api_version = os.environ.get("AZURE_API_VERSION","")

search_api_key = Secret.from_env_var("AZURE_SEARCH_API_KEY", strict=True)
search_azure_endpoint = Secret.from_env_var("AZURE_SEARCH_SERVICE_ENDPOINT", strict=True)

ca_cert = os.environ.get("ELASTICSEARCH_CA_CERT", None)
host = os.environ.get("ELASTICSEARCH_HOST", None) or "https://elasticsearch:9200"
username = os.environ.get("ELASTICSEARCH_USERNAME", "")
password = os.environ.get("ELASTICSEARCH_PASSWORD", "")


assert api_key and api_key is not None
assert deployment_name
assert base_url
assert api_version


doc_metadata_fields = {
    "category": str,
    "issue_date": datetime,
    "permit": str,
    "mine_number": str,
    "mine_name": str,
    "document_name": str,
    "document_manager_guid": str,
    "step": str,
    "step_path": str,
}

extra_field_config = {
    "category": {"filterable": True, "sortable": True, "facetable": True},
    "issue_date": {"filterable": True, "sortable": True, "facetable": True},
    "permit": {"filterable": True, "sortable": True, "facetable": True},
    "mine_number": {"filterable": True, "sortable": True, "facetable": True},
    "mine_name": {"filterable": True, "sortable": True, "facetable": True},
    "document_name": {"filterable": True, "sortable": True, "facetable": True},
    "document_manager_guid": {"filterable": True, "sortable": True, "facetable": True},
    "step": {"filterable": True, "sortable": True, "facetable": True},
    "step_path": {"filterable": True, "sortable": True, "facetable": True},
}

vector_search_config = VectorSearch()

azure_search_document_store = AzureSearchDocumentStore(
    extra_field_config=extra_field_config,
    api_key=search_api_key,
    azure_endpoint=search_azure_endpoint,
    index_name="permit-conditions",
    embedding_dimension=3072,
    metadata_fields=doc_metadata_fields,
    # vector_search_configuration=vector_search_config,
)

elasticsearch_document_store = ElasticsearchDocumentStore(
    hosts=host,
    basic_auth=(username, password),
    index="permit_condition_embeddings",
    embedding_similarity_function="cosine",
    ca_certs=ca_cert if ca_cert else None,
    verify_certs=True if ca_cert else False,
)


document_embedder = DocumentEmbedderCache(
    document_store=elasticsearch_document_store,
    cache_field="condition",
    azure_endpoint=base_url,
    azure_deployment="text-embedding-3-large",
    api_key=api_key,
)

cache_checker = EmbeddingCache(document_store=elasticsearch_document_store, cache_field="condition")
document_writer = DocumentWriter(document_store=azure_search_document_store, policy=DuplicatePolicy.OVERWRITE)
document_joiner = DocumentJoiner()

llm = AzureOpenAIChatGenerator(
    azure_endpoint=base_url,
    azure_deployment=deployment_name,
    api_key=api_key,
    api_version=api_version,
    generation_kwargs={"temperature": 0, "max_tokens": 16384, "n": 1},
)


def permit_condition_search_indexing_pipelinecre():
    """
    This function creates and returns a pipeline for extracting permit conditions.

    Returns:
        Pipeline: The pipeline object for extracting permit conditions.
    """
    index_pipeline = Pipeline()

    csv_converter = CSVToDocument()
    llm = AzureOpenAIChatGenerator(
        azure_endpoint=base_url,
        azure_deployment=deployment_name,
        api_key=api_key,
        api_version=api_version,
        generation_kwargs={"temperature": 0, "max_tokens": 16384},
    )


    index_pipeline.add_component("csv_converter", csv_converter)
    index_pipeline.add_component("cache_checker", cache_checker)

    index_pipeline.add_component("document_embedder", document_embedder)

    index_pipeline.add_component("document_joiner", document_joiner)
    index_pipeline.add_component("document_writer", document_writer)

    index_pipeline.connect("csv_converter", "cache_checker")
    index_pipeline.connect("cache_checker.misses", "document_embedder.documents")
    index_pipeline.connect("cache_checker.hits", "document_joiner")
    index_pipeline.connect("document_embedder", "document_joiner")
    index_pipeline.connect("document_joiner", "document_writer")

    return index_pipeline


template = [
    ChatMessage.from_system("""
        You are an expert assistant that helps users find information about permit conditions and reason about them. When answering a question or searching, you can only use the information in the sources provided. \n
        You must cite all your sources in square brackets with the prefix "doc" for example: Paris is the capital of france [doc:1].\n You must represent the information in the sources accurately and not modify the content at all. \n
        When you find a matching permit condition, you should enclose it in a Markdown blockquotes (>) to make it clear that it is a direct quote from the source. \n 
        
        You will be given a list of permit conditions (sources) with the content of the condition and and ID you can use to cite the source.
    """),
    ChatMessage.from_system("""
        Sources:
        {% for document in documents %}
            ID: {{ document.id }}
            Content: {{ document.content }}
        {% endfor %}
    """),
    ChatMessage.from_user("""
                          
    Question: {{question}}
    """)
]

prompt_builder = ChatPromptBuilder(template=template)
output_formatter = SearchOutputFormatter()

def permit_condition_search_retrieval_pipelinecre():
    text_embedder = AzureOpenAITextEmbedder(
        azure_endpoint=base_url,
        azure_deployment="text-embedding-3-large",
        api_key=api_key
    )

    retriever = AzureAISearchHybridRetriever(
        document_store=azure_search_document_store,
        facets=["category", "issue_date", "permit", "mine_number", "mine_name", "document_name"],
    )

    """
    This function creates and returns a pipeline for extracting permit conditions.

    Returns:
        Pipeline: The pipeline object for extracting permit conditions.
    """
    retrieval_pipeline = Pipeline()

    retrieval_pipeline.add_component("text_embedder", text_embedder)
    retrieval_pipeline.add_component("retriever", retriever)
    retrieval_pipeline.add_component("prompt_builder", prompt_builder)
    retrieval_pipeline.add_component("llm", llm)
    retrieval_pipeline.add_component("output", output_formatter)

    retrieval_pipeline.connect("text_embedder.embedding", "retriever.query_embedding")
    retrieval_pipeline.connect("retriever", "prompt_builder")
    retrieval_pipeline.connect("prompt_builder.prompt", "llm.messages")
    retrieval_pipeline.connect("retriever.documents", "output.documents")
    retrieval_pipeline.connect("llm.replies", "output.replies")

    return retrieval_pipeline

permit_condition_search_retrieval_pipeline = permit_condition_search_retrieval_pipelinecre()
permit_condition_search_indexing_pipeline = permit_condition_search_indexing_pipelinecre()
import logging
from datetime import datetime
from typing import List

from app.pipelines.permit_condition_search.components.azure_blob_upload import (
    AzureBlobUploader,
)
from app.pipelines.permit_condition_search.components.context_enricher import (
    ContextEnricher,
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
    "parent_ids": List[str],  # Changed from parent_id to parent_ids
    "sibling_ids": List[str],  # Add sibling_ids
    "child_ids": List[str],    # Add child_ids
    "report_name": str,  # Add report_name field
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
    You are an expert assistant that helps users retrieve and reason about permit conditions in the mining industry. When answering questions, use only the information provided in the sources and cite them using square brackets with the prefix "doc" (e.g., [doc:1]).

    Follow these guidelines:
    1. Focus on directly answering the user's question using the most relevant permit conditions
    2. Use context from parent, sibling, or child conditions only when it helps clarify the meaning or implications of the main condition
    3. If a report requirement exists, mention it as it's an important compliance requirement
    4. Present information in a clear, concise manner
    5. Use Markdown blockquotes (>) for direct quotes from permit conditions
    6. Always maintain the exact wording from the source documents
    7. If you're unsure or the information isn't in the sources, say so
    8. Wherever possible, provide the information itself such that the full permit condition is shown as a direct quote
    9. Output the results as markdown, with appropriate headings.
    
    Sources:
    {% for document in documents %}
        ID: {{ document.id }}
        {% if document.meta.report_name %}
        Report Required: {{ document.meta.report_name }}
        {% endif %}
        
        Main Condition:
        > {{ document.content }}
        
        {% if document.meta.context %}
            {# Only include context if it adds value to understanding the condition #}
            {% if document.meta.context.parent_contexts %}
                {% for level_num in range(1, document.meta.context.parent_contexts|length + 1) %}
                    {% set level = document.meta.context.parent_contexts["level_" ~ level_num] %}
                    {% if level.content and level.content|length > 0 %}
        Related Context:
        > {{ level.content }}
                    {% endif %}
                {% endfor %}
            {% endif %}

            {# Include children/siblings only if they provide essential context #}
            {% if document.meta.context.child_contexts or document.meta.context.sibling_contexts %}
        Additional Context:
                {% if document.meta.context.sibling_contexts.previous %}
                    {% for sibling in document.meta.context.sibling_contexts.previous %}
        > {{ sibling.content }}
                    {% endfor %}
                {% endif %}
                {% if document.meta.context.sibling_contexts.next %}
                    {% for sibling in document.meta.context.sibling_contexts.next %}
        > {{ sibling.content }}
                    {% endfor %}
                {% endif %}
                {% if document.meta.context.child_contexts %}
                    {% for child in document.meta.context.child_contexts %}
        > {{ child.content }}
                    {% endfor %}
                {% endif %}
            {% endif %}
        {% endif %}
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
    
    context_enricher = ContextEnricher(document_store=azure_search_document_store)
    
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
    retrieval_pipeline.add_component("context_enricher", context_enricher)
    retrieval_pipeline.add_component("prompt_builder", prompt_builder)
    retrieval_pipeline.add_component("llm", llm)
    retrieval_pipeline.add_component("output_formatter", output_formatter)

    retrieval_pipeline.connect("text_embedder.embedding", "retriever.query_embedding")
    retrieval_pipeline.connect("retriever", "context_enricher")
    retrieval_pipeline.connect("context_enricher", "prompt_builder.documents")
    retrieval_pipeline.connect("prompt_builder", "llm")
    retrieval_pipeline.connect("retriever.documents", "output_formatter.documents")
    retrieval_pipeline.connect("llm.replies", "output_formatter.replies")

    return retrieval_pipeline

permit_condition_search_retrieval_pipeline = create_permit_condition_search_retrieval_pipeline()
permit_condition_search_indexing_pipeline = create_permit_condition_search_indexing_pipeline()
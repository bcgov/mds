from app.pipelines.document_search.config import config
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexerClient
from azure.search.documents.indexes.models import (
    AzureOpenAIEmbeddingSkill,
    BlobIndexerParsingMode,
    FieldMapping,
    IndexingParameters,
    IndexingParametersConfiguration,
    IndexingSchedule,
    InputFieldMappingEntry,
    OutputFieldMappingEntry,
    SearchIndexer,
    SearchIndexerDataContainer,
    SearchIndexerDataSourceConnection,
    SearchIndexerSkillset,
)
from datetime import timedelta

search_api_key = config.search.api_key.resolve_value()
assert search_api_key, "Search API key is required"

credential = AzureKeyCredential(search_api_key)
indexer_client = SearchIndexerClient(
    endpoint=config.search.endpoint.resolve_value(), credential=credential
)


def create_data_source():
    data_source = SearchIndexerDataSourceConnection(
        name=config.search.data_source.resolve_value(),
        type="azureblob",
        connection_string=config.storage.connection_string,
        container=SearchIndexerDataContainer(
            name=config.storage.container_name, query="now-indexing"
        ),
    )
    return indexer_client.create_or_update_data_source_connection(data_source)


def create_skillset():
    skillset = SearchIndexerSkillset(
        name=config.search.skillset_name.resolve_value(),
        description="Skillset for processing NoW application documents",
        skills=[
            AzureOpenAIEmbeddingSkill(
                name="ChunkEmbedder",
                description="Generate embeddings for document chunks",
                context="/document",
                resource_url=config.openai.endpoint.resolve_value(),
                api_key=config.openai.api_key.resolve_value(),
                model_name=config.openai.embedding_model,
                deployment_name=config.openai.embedding_model,
                inputs=[
                    InputFieldMappingEntry(name="text", source="/document/content")
                ],
                outputs=[
                    OutputFieldMappingEntry(name="embedding", target_name="embedding")
                ],
            )
        ],
    )
    return indexer_client.create_or_update_skillset(skillset)


def create_indexer():
    """
    Creates an Azure AI Search Indexer that parses CSV files placed in the
    now-indexing/ blob container folder, generates embeddings for each chunk,
    and writes results to the NoW application document search index.
    """
    indexer = SearchIndexer(
        name=config.search.indexer_name.resolve_value(),
        data_source_name=config.search.data_source.resolve_value(),
        target_index_name=config.search.index_name.resolve_value(),
        skillset_name=config.search.skillset_name.resolve_value(),
        parameters=IndexingParameters(
            batch_size=100,
            configuration=IndexingParametersConfiguration(
                parsing_mode=BlobIndexerParsingMode.DELIMITED_TEXT,
                first_line_contains_headers=True,
                query_timeout=None,
            ),
            execution_environment="private",
        ),
        schedule=IndexingSchedule(interval=timedelta(minutes=5)),
        output_field_mappings=[
            FieldMapping(source_field_name="/document/id", target_field_name="id"),
            FieldMapping(source_field_name="/document/content", target_field_name="content"),
            FieldMapping(source_field_name="/document/now_application_guid", target_field_name="now_application_guid"),
            FieldMapping(source_field_name="/document/mine_guid", target_field_name="mine_guid"),
            FieldMapping(source_field_name="/document/document_manager_guid", target_field_name="document_manager_guid"),
            FieldMapping(source_field_name="/document/document_name", target_field_name="document_name"),
            FieldMapping(source_field_name="/document/document_type", target_field_name="document_type"),
            FieldMapping(source_field_name="/document/submitted_date", target_field_name="submitted_date"),
            FieldMapping(source_field_name="/document/embedding", target_field_name="embedding"),
        ],
    )
    return indexer_client.create_or_update_indexer(indexer)


def create_search_indexer():
    print("Creating data source...")
    create_data_source()

    print("Creating skillset...")
    create_skillset()

    print("Creating indexer...")
    indexer = create_indexer()

    print(f"Created indexer: {indexer.name}")

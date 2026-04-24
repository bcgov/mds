
from datetime import timedelta

from app.pipelines.permit_condition_search.config import config
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

search_api_key = config.search.api_key.resolve_value()
assert search_api_key is not None, "Search API key is required"

credential = AzureKeyCredential(search_api_key)
indexer_client = SearchIndexerClient(endpoint=config.search.endpoint.resolve_value(), credential=credential)

def create_data_source():
    data_source = SearchIndexerDataSourceConnection(
        name=config.search.data_source.resolve_value(),
        type="azureblob",
        connection_string=config.storage.connection_string,
        container=SearchIndexerDataContainer(name=config.storage.container_name, query="indexing"),
    )
    
    return indexer_client.create_or_update_data_source_connection(data_source)

def create_skillset():
    # Create a skillset with text splitting and embedding generation
    skillset = SearchIndexerSkillset(
        name=config.search.skillset_name.resolve_value(),
        description="Skillset for processing permit conditions",
        skills=[
            AzureOpenAIEmbeddingSkill(
                name="ChunkEmbedder",
                description="Generate embeddings for chunks",
                context="/document",
                resource_url=config.openai.get_resource_url(),
                api_key=config.openai.api_key.resolve_value(),
                model_name=config.openai.embedding_model,
                deployment_name=config.openai.embedding_model,
                inputs=[
                    InputFieldMappingEntry(
                        name="text",
                        source="/document/condition"
                    )
                ],
                outputs=[
                    OutputFieldMappingEntry(
                        name="embedding",
                        target_name="embedding"
                    )
                ]
            )
        ]
    )

    return indexer_client.create_or_update_skillset(skillset)


def create_indexer():
    """
    Creates an Azure AI Search Indexer that parses CSV files put in the permit-conditions-data blob container,
    generates embeddings for the condition content, and indexes the data in the permit-conditions index.
    """
    indexer = SearchIndexer(
        name=config.search.indexer_name.resolve_value(),
        data_source_name=config.search.data_source.resolve_value(),
        target_index_name=config.search.index_name.resolve_value(),
        skillset_name=config.search.skillset_name.resolve_value(), # The skillset will generate embeddings for the condition content
        parameters=IndexingParameters(
            batch_size=100,
            configuration=IndexingParametersConfiguration(
                parsing_mode=BlobIndexerParsingMode.DELIMITED_TEXT,
                first_line_contains_headers=True,
                query_timeout=None
            ),
            execution_environment='private'
        ),
        schedule=IndexingSchedule(interval=timedelta(minutes=5)),
        output_field_mappings=[
            FieldMapping(
                source_field_name="/document/id",
                target_field_name="id"
            ),
            FieldMapping(
                source_field_name="/document/condition",
                target_field_name="content"
            ),
            FieldMapping(
                source_field_name="/document/category",
                target_field_name="category"
            ),
            FieldMapping(
                source_field_name="/document/issue_date",
                target_field_name="issue_date"
            ),
            FieldMapping(
                source_field_name="/document/permit",
                target_field_name="permit"
            ),
            FieldMapping(
                source_field_name="/document/mine_number",
                target_field_name="mine_number"
            ),
            FieldMapping(
                source_field_name="/document/mine_name",
                target_field_name="mine_name"
            ),
            FieldMapping(
                source_field_name="/document/document_name",
                target_field_name="document_name"
            ),
            FieldMapping(
                source_field_name="/document/document_manager_guid",
                target_field_name="document_manager_guid"
            ),
            FieldMapping(
                source_field_name="/document/step",
                target_field_name="step"
            ),
            FieldMapping(
                source_field_name="/document/step_path",
                target_field_name="step_path"
            ),
            FieldMapping(
                source_field_name="/document/permit_guid",
                target_field_name="permit_guid"
            ),
            FieldMapping(
                source_field_name="/document/permit_type",
                target_field_name="permit_type"
            ),
            FieldMapping(
                source_field_name="/document/mine_guid",
                target_field_name="mine_guid"
            ),
            FieldMapping(
                source_field_name="/document/permit_condition_guid",
                target_field_name="permit_condition_guid"
            ),
            FieldMapping(
                source_field_name="/document/permit_amendment_guid",
                target_field_name="permit_amendment_guid"
            ),
            FieldMapping(
                source_field_name="/document/embedding",
                target_field_name="embedding"
            ),
            FieldMapping(
                source_field_name="/document/tenure",
                target_field_name="tenure"
            ),
        ],
    )
    
    return indexer_client.create_or_update_indexer(indexer)

def create_search_indexer():
    # Create all components in order
    print("Creating data source...")
    create_data_source()
    
    print("Creating skillset...")
    create_skillset()
    
    print("Creating indexer...")
    indexer = create_indexer()
    
    print(f"Created indexer: {indexer.name}")
    print("You can now run the indexer to process your CSV file")

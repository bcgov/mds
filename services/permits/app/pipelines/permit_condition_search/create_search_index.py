import os

from app.pipelines.permit_condition_search.config import config
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    AzureOpenAIVectorizer,
    AzureOpenAIVectorizerParameters,
    HnswAlgorithmConfiguration,
    ScalarQuantizationCompression,
    ScalarQuantizationParameters,
    SearchField,
    SearchFieldDataType,
    SearchIndex,
    SemanticConfiguration,
    SemanticField,
    SemanticPrioritizedFields,
    SemanticSearch,
    VectorSearch,
    VectorSearchProfile,
)
from haystack.utils import Secret

search_api_key = config.search.api_key.resolve_value()
assert search_api_key is not None, "Search API key is required"

# Initialize the search client
credential = AzureKeyCredential(search_api_key)
index_client = SearchIndexClient(endpoint=config.search.endpoint, credential=credential)

# Define fields with explicit settings
fields = [
    SearchField(
        name="id", 
        type=SearchFieldDataType.String, 
        key=True,
        searchable=True,
        filterable=True,
        sortable=True,
        facetable=False
    ),
    SearchField(
        name="content", 
        type=SearchFieldDataType.String, 
        searchable=True,
        filterable=False,
        sortable=False,
        facetable=False
    ),
    SearchField(
        name="category", 
        type=SearchFieldDataType.String, 
        searchable=True,
        filterable=True, 
        sortable=True, 
        facetable=True
    ),
    SearchField(
        name="issue_date", 
        type=SearchFieldDataType.DateTimeOffset, 
        searchable=False,
        filterable=True, 
        sortable=True, 
        facetable=True
    ),
    SearchField(
        name="permit", 
        type=SearchFieldDataType.String, 
        searchable=True,
        filterable=True, 
        sortable=True, 
        facetable=True
    ),
    SearchField(
        name="mine_number", 
        type=SearchFieldDataType.String, 
        searchable=True,
        filterable=True, 
        sortable=True, 
        facetable=True
    ),
    SearchField(
        name="mine_name", 
        type=SearchFieldDataType.String, 
        searchable=True,
        filterable=True, 
        sortable=True, 
        facetable=True
    ),
    SearchField(
        name="document_name", 
        type=SearchFieldDataType.String, 
        searchable=True,
        filterable=True, 
        sortable=True, 
        facetable=True
    ),
    SearchField(
        name="document_manager_guid", 
        type=SearchFieldDataType.String, 
        searchable=True,
        filterable=True, 
        sortable=True, 
        facetable=True
    ),
    SearchField(
        name="step", 
        type=SearchFieldDataType.String, 
        searchable=True,
        filterable=True, 
        sortable=True, 
        facetable=True
    ),
    SearchField(
        name="step_path", 
        type=SearchFieldDataType.String, 
        searchable=True,
        filterable=True, 
        sortable=True, 
        facetable=True
    ),
    SearchField(
        name="permit_guid", 
        type=SearchFieldDataType.String, 
        searchable=False,
        filterable=True,
        sortable=False,
        facetable=False
    ),
    SearchField(
        name="mine_guid", 
        type=SearchFieldDataType.String, 
        searchable=False,
        filterable=True,
        sortable=False,
        facetable=False
    ),
    SearchField(
        name="permit_condition_guid", 
        type=SearchFieldDataType.String, 
        searchable=False,
        filterable=True,
        sortable=False,
        facetable=False
    ),
    SearchField(
        name="permit_amendment_guid", 
        type=SearchFieldDataType.String, 
        searchable=False,
        filterable=True,
        sortable=False,
        facetable=False
    ),
    SearchField(
        name="embedding", 
        type="Collection(Edm.Half)", 
        vector_search_dimensions=3072, 
        vector_search_profile_name="vector-profile",
        searchable=True,
        filterable=False,
        sortable=False,
        facetable=False,
        stored=False
    )
]

# Vector search configuration
vector_search = VectorSearch(
    algorithms=[
        HnswAlgorithmConfiguration(
            name="vector-algorithm",
        ),
    ],
    profiles=[
        VectorSearchProfile(
            name="vector-profile",
            algorithm_configuration_name="vector-algorithm",
            vectorizer_name="text-embedding-vectorizer",
            compression_name="vector-compression"
        )
    ],
    vectorizers=[
        AzureOpenAIVectorizer(
            vectorizer_name="text-embedding-vectorizer",
            kind="azureOpenAI",
            parameters=AzureOpenAIVectorizerParameters(
                api_key=config.openai.api_key.resolve_value(),
                resource_url=config.openai.endpoint,
                deployment_name="text-embedding-3-large",
                model_name="text-embedding-3-large"
            ),
        ),
    ],
    compressions=[
        ScalarQuantizationCompression(
            compression_name="vector-compression",
            rerank_with_original_vectors=True,
            default_oversampling=10,
            parameters=ScalarQuantizationParameters(quantized_data_type="int8"),
        )
    ]
)

# Semantic search configuration
semantic_config = SemanticConfiguration(
    name="permit-semantic-config",
    prioritized_fields=SemanticPrioritizedFields(
        title_field=SemanticField(field_name="category"),
        keywords_fields=[
            SemanticField(field_name="category"),
            SemanticField(field_name="mine_name"),
            SemanticField(field_name="mine_number"),
            SemanticField(field_name="permit"),
            SemanticField(field_name="step_path"),
            SemanticField(field_name="document_name")
        ],
        content_fields=[SemanticField(field_name="content")]
    )
)

semantic_search = SemanticSearch(configurations=[semantic_config])

# Scoring profile
# scoring_profile = ScoringProfile(
#     name="permit-scoring",
#     functions=[
#         TagScoringFunction(
#             field_name="category",
#             boost=2.0,
#             parameters=TagScoringParameters(
#                 tags_parameter="categories",
#             ),
#         )
#     ]
# )

# Create or update index
index = SearchIndex(
    name="permit-conditions",
    fields=fields,
    vector_search=vector_search,
    semantic_search=semantic_search,
    # scoring_profiles=[scoring_profile]
)

def create_or_update_index():
    result = index_client.create_or_update_index(index)
    print(f"Created/Updated index {result.name}")
    return result
import os
from datetime import datetime

from azure.core.credentials import AzureKeyCredential
from azure.identity import DefaultAzureCredential
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    AzureOpenAIVectorizer,
    AzureOpenAIVectorizerParameters,
    HnswAlgorithmConfiguration,
    ScalarQuantizationCompression,
    ScalarQuantizationParameters,
    ScoringProfile,
    SearchField,
    SearchFieldDataType,
    SearchIndex,
    SemanticConfiguration,
    SemanticField,
    SemanticPrioritizedFields,
    SemanticSearch,
    TagScoringFunction,
    TagScoringParameters,
    VectorSearch,
    VectorSearchProfile,
)
from haystack.utils import Secret

# Environment variables
AZURE_SEARCH_ENDPOINT = os.environ.get("AZURE_SEARCH_SERVICE_ENDPOINT")
AZURE_OPENAI_ENDPOINT = os.environ.get("AZURE_BASE_URL")
SEARCH_API_KEY = Secret.from_env_var("AZURE_SEARCH_API_KEY", strict=True).resolve_value()
AZURE_OPENAI_API_KEY = Secret.from_env_var("AZURE_API_KEY", strict=True)
assert AZURE_SEARCH_ENDPOINT, "Missing environment variable AZURE_SEARCH_SERVICE_ENDPOINT"
assert SEARCH_API_KEY, "Missing environment variable AZURE_SEARCH_API_KEY"
# Initialize the search client
credential = AzureKeyCredential(SEARCH_API_KEY)
index_client = SearchIndexClient(endpoint=AZURE_SEARCH_ENDPOINT, credential=credential)

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
                api_key=AZURE_OPENAI_API_KEY.resolve_value(),
                resource_url=AZURE_OPENAI_ENDPOINT,
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
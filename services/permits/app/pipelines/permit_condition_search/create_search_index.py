from datetime import timedelta

from app.pipelines.permit_condition_search.config import config
from app.pipelines.permit_condition_search.search_index_fields import fields
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    AzureOpenAIVectorizer,
    AzureOpenAIVectorizerParameters,
    FreshnessScoringFunction,
    FreshnessScoringParameters,
    HnswAlgorithmConfiguration,
    ScalarQuantizationCompression,
    ScalarQuantizationParameters,
    ScoringFunctionAggregation,
    ScoringFunctionInterpolation,
    ScoringProfile,
    SearchIndex,
    SemanticConfiguration,
    SemanticField,
    SemanticPrioritizedFields,
    SemanticSearch,
    VectorSearch,
    VectorSearchProfile,
)

search_api_key = config.search.api_key.resolve_value()
search_api_endpoint = config.search.endpoint.resolve_value()
assert search_api_key is not None, "Search API key is required"
assert search_api_key is not None, "Search API key is required"

# Initialize the search client
credential = AzureKeyCredential(search_api_key)


index_client = SearchIndexClient(endpoint=search_api_endpoint,credential=credential)

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
            compression_name="vector-compression",
        )
    ],
    vectorizers=[
        # Use the internal Azure OpenAI vectorizer to convert text to embeddings so we don't have to pre-calculate these.
        AzureOpenAIVectorizer(
            vectorizer_name="text-embedding-vectorizer",
            kind="azureOpenAI",
            parameters=AzureOpenAIVectorizerParameters(
                api_key=config.openai.api_key.resolve_value(),
                resource_url=config.openai.endpoint.resolve_value(),
                deployment_name="text-embedding-3-large",
                model_name="text-embedding-3-large",
            ),
        ),
    ],
    compressions=[
        # Compress embeddings so they take up less space in the index.
        ScalarQuantizationCompression(
            compression_name="vector-compression",
            rerank_with_original_vectors=True,
            default_oversampling=10,
            parameters=ScalarQuantizationParameters(quantized_data_type="int8"),
        )
    ],
)

# Perform hybrid vector/keyword search on the content field, keyword search on metadata, and give a little boost to the category.
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
            SemanticField(field_name="document_name"),
        ],
        content_fields=[SemanticField(field_name="content")],
    ),
)

semantic_search = SemanticSearch(configurations=[semantic_config])

# Scoring profile to boost documents based on their issue date. The intention is for newer amendments to be ranked higher if a search matches accross multiple amendments.
scoring_profile = ScoringProfile(
    name="recency-boost-profile",
    functions=[
        FreshnessScoringFunction(
            field_name="issue_date",
            boost=3.0,
            parameters=FreshnessScoringParameters(
                boosting_duration=timedelta(
                    days=365 * 70 # Go back 70 years
                )
            ),
            interpolation=ScoringFunctionInterpolation.LINEAR,
        )
    ],
    function_aggregation=ScoringFunctionAggregation.SUM,
)

# Create or update index
index = SearchIndex(
    name=config.search.index_name.resolve_value(),
    fields=fields,
    vector_search=vector_search,
    semantic_search=semantic_search,
    scoring_profiles=[scoring_profile],
    default_scoring_profile="recency-boost-profile",
)


def create_or_update_index():
    result = index_client.create_or_update_index(index)
    print(f"Created/Updated index {result.name}")
    return result

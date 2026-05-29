from app.pipelines.document_search.config import config
from app.pipelines.document_search.search_index_fields import fields
from azure.core.credentials import AzureKeyCredential
from azure.core.exceptions import HttpResponseError
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    AzureOpenAIVectorizer,
    AzureOpenAIVectorizerParameters,
    HnswAlgorithmConfiguration,
    ScalarQuantizationCompression,
    ScalarQuantizationParameters,
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
assert search_api_key, "Search API key is required"
assert search_api_endpoint, "Search endpoint is required"

credential = AzureKeyCredential(search_api_key)
index_client = SearchIndexClient(endpoint=search_api_endpoint, credential=credential)

vector_search = VectorSearch(
    algorithms=[
        HnswAlgorithmConfiguration(name="vector-algorithm"),
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
        AzureOpenAIVectorizer(
            vectorizer_name="text-embedding-vectorizer",
            kind="azureOpenAI",
            parameters=AzureOpenAIVectorizerParameters(
                api_key=config.openai.api_key.resolve_value(),
                resource_url=config.openai.get_resource_url(),
                deployment_name="text-embedding-3-large",
                model_name="text-embedding-3-large",
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
    ],
)

# Semantic config: prioritise document_name as title, content as the main search field.
semantic_config = SemanticConfiguration(
    name="now-document-semantic-config",
    prioritized_fields=SemanticPrioritizedFields(
        title_field=SemanticField(field_name="document_name"),
        keywords_fields=[
            SemanticField(field_name="document_name"),
            SemanticField(field_name="document_type"),
            SemanticField(field_name="artifact_caption"),
            SemanticField(field_name="artifact_summary"),
        ],
        content_fields=[SemanticField(field_name="content")],
    ),
)

semantic_search = SemanticSearch(configurations=[semantic_config])

index = SearchIndex(
    name=config.search.index_name.resolve_value(),
    fields=fields,
    vector_search=vector_search,
    semantic_search=semantic_search,
)


def create_or_update_index():
    try:
        result = index_client.create_or_update_index(index)
        print(f"Created index: {result.name}")
    except HttpResponseError as e:
        if "ResourceNameAlreadyInUse" in str(e) or "CannotCreateExistingIndex" in str(e):
            print(f"Index '{index.name}' already exists, skipping.")
            result = index_client.get_index(index.name)
        else:
            raise
    return result

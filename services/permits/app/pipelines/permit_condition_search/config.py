import os
from dataclasses import dataclass
from typing import Optional

from haystack.utils import Secret


@dataclass
class DocumentIntelligenceConfig:
    endpoint: str
    api_key: Secret
    api_version: str

@dataclass
class AzureOpenAIConfig:
    api_key: Secret
    endpoint: Secret
    deployment_name: str
    api_version: str
    embedding_model: str = "text-embedding-3-large"

@dataclass
class AzureSearchConfig:
    endpoint: Secret
    api_key: Secret
    index_name: Secret
    data_source: Secret
    indexer_name: Secret
    skillset_name: Secret
    embedding_dimension: int = 3072

@dataclass
class AzureStorageConfig:
    connection_string: str
    container_name: str
    blob_service_endpoint: Optional[str] = None

@dataclass
class ElasticsearchConfig:
    host: str
    username: str
    password: str
    ca_cert: Optional[str]
    index_name: str = "permit_condition_embeddings"

@dataclass
class Config:
    openai: AzureOpenAIConfig
    search: AzureSearchConfig
    storage: AzureStorageConfig
    elasticsearch: ElasticsearchConfig
    document_intelligence: DocumentIntelligenceConfig

    @classmethod
    def from_env(cls) -> 'Config':
        # Azure OpenAI configuration
        openai = AzureOpenAIConfig(
            api_key=Secret.from_env_var("AZURE_API_KEY", strict=True),
            endpoint=Secret.from_env_var("AZURE_BASE_URL", strict=True),
            deployment_name=os.environ["AZURE_DEPLOYMENT_NAME"],
            api_version=os.environ.get("AZURE_API_VERSION", "2024-02-01"),
            embedding_model="text-embedding-3-large"
        )

        # Azure Search configuration
        search = AzureSearchConfig(
            endpoint=Secret.from_env_var("AZURE_SEARCH_SERVICE_ENDPOINT", strict=True),
            api_key=Secret.from_env_var("AZURE_SEARCH_API_KEY", strict=True),
            index_name=Secret.from_env_var("AZURE_SEARCH_INDEX_NAME", strict=True),
            data_source=Secret.from_env_var("AZURE_SEARCH_DATA_SOURCE", strict=True),
            indexer_name=Secret.from_env_var("AZURE_SEARCH_INDEXER_NAME", strict=True),
            skillset_name=Secret.from_env_var("AZURE_SEARCH_SKILLSET", strict=True),
            embedding_dimension=3072
        )

        # Azure Storage configuration
        storage = AzureStorageConfig(
            connection_string=os.environ["AZURE_STORAGE_CONNECTION_STRING"],
            container_name=os.environ["AZURE_STORAGE_CONTAINER"],
            blob_service_endpoint=os.environ.get("AZURE_STORAGE_BLOB_SERVICE_ENDPOINT")
        )

        # Elasticsearch configuration
        elasticsearch = ElasticsearchConfig(
            host=os.environ.get("ELASTICSEARCH_HOST", "https://elasticsearch:9200"),
            username=os.environ.get("ELASTICSEARCH_USERNAME", "elastic"),
            password=os.environ.get("ELASTICSEARCH_PASSWORD", "elastic"),
            ca_cert=os.environ.get("ELASTICSEARCH_CA_CERT"),
            index_name="permit_condition_embeddings"
        )

        # Document Intelligence configuration
        document_intelligence = DocumentIntelligenceConfig(
            endpoint=os.environ["DOCUMENTINTELLIGENCE_ENDPOINT"],
            api_key=Secret.from_env_var("DOCUMENTINTELLIGENCE_API_KEY", strict=True),
            api_version=os.environ.get("DOCUMENTINTELLIGENCE_API_VERSION", "2024-11-30")
        )

        return cls(
            openai=openai,
            search=search,
            storage=storage,
            elasticsearch=elasticsearch,
            document_intelligence=document_intelligence,
        )

config = Config.from_env()

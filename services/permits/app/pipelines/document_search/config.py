import os
from dataclasses import dataclass

from app.pipelines.permit_condition_search.config import (
    AzureOpenAIConfig,
    AzureSearchConfig,
    AzureStorageConfig,
    DocumentIntelligenceConfig,
    ElasticsearchConfig,
)
from haystack.utils import Secret


@dataclass
class DocumentSearchConfig:
    """
    Configuration for the generic document search pipeline.

    Reuses the shared Azure OpenAI, storage, and Document Intelligence settings
    from the permit service config, but points at a separate index/indexer/skillset
    so the two search domains remain fully isolated.
    """
    openai: AzureOpenAIConfig
    search: AzureSearchConfig
    storage: AzureStorageConfig
    document_intelligence: DocumentIntelligenceConfig
    multimodal_enrichment_enabled: bool
    multimodal_summary_max_chars: int
    multimodal_prompt_max_workers: int

    @classmethod
    def from_env(cls) -> "DocumentSearchConfig":
        openai_resource_url = None
        if os.environ.get("AZURE_OPENAI_RESOURCE_URL"):
            openai_resource_url = Secret.from_env_var("AZURE_OPENAI_RESOURCE_URL", strict=False)

        openai = AzureOpenAIConfig(
            api_key=Secret.from_env_var("AZURE_API_KEY", strict=True),
            endpoint=Secret.from_env_var("AZURE_BASE_URL", strict=True),
            deployment_name=os.environ["AZURE_DEPLOYMENT_NAME"],
            api_version=os.environ.get("AZURE_API_VERSION", "2024-02-01"),
            embedding_model=os.environ.get(
                "AZURE_EMBEDDING_DEPLOYMENT_NAME", "text-embedding-3-large"
            ),
            openai_resource_url=openai_resource_url,
        )

        # These env vars are dedicated to the document search index so it stays
        # isolated from the permit conditions index.
        search = AzureSearchConfig(
            endpoint=Secret.from_env_var("AZURE_SEARCH_SERVICE_ENDPOINT", strict=True),
            api_key=Secret.from_env_var("AZURE_SEARCH_API_KEY", strict=True),
            index_name=Secret.from_env_var("AZURE_NOW_SEARCH_INDEX_NAME", strict=True),
            data_source=Secret.from_env_var("AZURE_NOW_SEARCH_DATA_SOURCE", strict=True),
            indexer_name=Secret.from_env_var("AZURE_NOW_SEARCH_INDEXER_NAME", strict=True),
            skillset_name=Secret.from_env_var("AZURE_NOW_SEARCH_SKILLSET", strict=True),
            embedding_dimension=3072,
        )

        storage = AzureStorageConfig(
            connection_string=os.environ["AZURE_STORAGE_CONNECTION_STRING"],
            container_name=os.environ["AZURE_STORAGE_CONTAINER"],
            blob_service_endpoint=os.environ.get("AZURE_STORAGE_BLOB_SERVICE_ENDPOINT"),
        )

        document_intelligence = DocumentIntelligenceConfig(
            endpoint=os.environ["DOCUMENTINTELLIGENCE_ENDPOINT"],
            api_key=Secret.from_env_var("DOCUMENTINTELLIGENCE_API_KEY", strict=True),
            api_version=os.environ.get("DOCUMENTINTELLIGENCE_API_VERSION", "2024-11-30"),
        )

        multimodal_enrichment_enabled = (
            os.environ.get("DOCUMENT_SEARCH_ENABLE_MULTIMODAL_ENRICHMENT", "true")
            .strip()
            .lower()
            in {"1", "true", "yes", "on"}
        )
        multimodal_summary_max_chars = int(
            os.environ.get("DOCUMENT_SEARCH_MULTIMODAL_SUMMARY_MAX_CHARS", "320")
        )
        multimodal_prompt_max_workers = int(
            os.environ.get("DOCUMENT_SEARCH_MULTIMODAL_PROMPT_MAX_WORKERS", "4")
        )

        return cls(
            openai=openai,
            search=search,
            storage=storage,
            document_intelligence=document_intelligence,
            multimodal_enrichment_enabled=multimodal_enrichment_enabled,
            multimodal_summary_max_chars=multimodal_summary_max_chars,
            multimodal_prompt_max_workers=multimodal_prompt_max_workers,
        )


config = DocumentSearchConfig.from_env()

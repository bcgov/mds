import os
from unittest.mock import patch

import pytest
from app.common.types.context import SafeContext, context
from app.pipelines.permit_condition_search.config import (
    AzureOpenAIConfig,
    Config,
    Secret,
)


def test_context_default():
    assert isinstance(context.get(), SafeContext)

def test_safe_context_update_state():
    sc = SafeContext()
    # Should not raise anything
    sc.update_state(a=1)

def test_azure_openai_config_get_resource_url():
    # Test with openai_resource_url set
    cfg = AzureOpenAIConfig(
        api_key=Secret.from_token("key"),
        endpoint=Secret.from_token("https://endpoint"),
        deployment_name="deploy",
        api_version="1",
        openai_resource_url=Secret.from_token("https://resource")
    )
    assert cfg.get_resource_url() == "https://resource"

    # Test without openai_resource_url set (falls back to a real Azure OpenAI endpoint)
    cfg = AzureOpenAIConfig(
        api_key=Secret.from_token("key"),
        endpoint=Secret.from_token("https://endpoint.openai.azure.com"),
        deployment_name="deploy",
        api_version="1"
    )
    assert cfg.get_resource_url() == "https://endpoint.openai.azure.com"


def test_azure_openai_config_get_resource_url_rejects_proxy_endpoint():
    cfg = AzureOpenAIConfig(
        api_key=Secret.from_token("key"),
        endpoint=Secret.from_token("https://proxy.local/api/ai"),
        deployment_name="deploy",
        api_version="1",
    )

    with pytest.raises(RuntimeError, match="AZURE_OPENAI_RESOURCE_URL"):
        cfg.get_resource_url()


def test_config_from_env_prefers_openai_resource_url():
    env_vars = {
        "AZURE_API_KEY": "test-key",
        "AZURE_BASE_URL": "https://test-base.proxy.local",
        "AZURE_DEPLOYMENT_NAME": "test-deploy",
        "AZURE_OPENAI_ENDPOINT": "https://test-base.proxy.local",
        "AZURE_OPENAI_RESOURCE_URL": "https://test-resource.openai.azure.com",
        "AZURE_SEARCH_SERVICE_ENDPOINT": "https://test-search",
        "AZURE_SEARCH_API_KEY": "test-search-key",
        "AZURE_SEARCH_INDEX_NAME": "test-index",
        "AZURE_SEARCH_DATA_SOURCE": "test-ds",
        "AZURE_SEARCH_INDEXER_NAME": "test-indexer",
        "AZURE_SEARCH_SKILLSET": "test-skillset",
        "AZURE_STORAGE_CONNECTION_STRING": "test-conn",
        "AZURE_STORAGE_CONTAINER": "test-container",
        "DOCUMENTINTELLIGENCE_ENDPOINT": "https://test-di",
        "DOCUMENTINTELLIGENCE_API_KEY": "test-di-key",
    }
    with patch.dict(os.environ, env_vars, clear=False):
        cfg = Config.from_env()
        assert cfg.openai.get_resource_url() == "https://test-resource.openai.azure.com"

def test_config_from_env():
    env_vars = {
        "AZURE_API_KEY": "test-key",
        "AZURE_BASE_URL": "https://test-base",
        "AZURE_DEPLOYMENT_NAME": "test-deploy",
        "AZURE_SEARCH_SERVICE_ENDPOINT": "https://test-search",
        "AZURE_SEARCH_API_KEY": "test-search-key",
        "AZURE_SEARCH_INDEX_NAME": "test-index",
        "AZURE_SEARCH_DATA_SOURCE": "test-ds",
        "AZURE_SEARCH_INDEXER_NAME": "test-indexer",
        "AZURE_SEARCH_SKILLSET": "test-skillset",
        "AZURE_STORAGE_CONNECTION_STRING": "test-conn",
        "AZURE_STORAGE_CONTAINER": "test-container",
        "DOCUMENTINTELLIGENCE_ENDPOINT": "https://test-di",
        "DOCUMENTINTELLIGENCE_API_KEY": "test-di-key",
    }
    with patch.dict(os.environ, env_vars):
        cfg = Config.from_env()
        assert cfg.openai.api_key.resolve_value() == "test-key"
        assert cfg.search.endpoint.resolve_value() == "https://test-search"
        assert cfg.storage.connection_string == "test-conn"
        assert cfg.document_intelligence.endpoint == "https://test-di"

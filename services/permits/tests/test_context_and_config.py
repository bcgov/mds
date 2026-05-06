import os
import pytest
from unittest.mock import patch
from app.common.types.context import context, SafeContext
from app.pipelines.permit_condition_search.config import Config, AzureOpenAIConfig, Secret

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

    # Test without openai_resource_url set (falls back to endpoint)
    cfg = AzureOpenAIConfig(
        api_key=Secret.from_token("key"),
        endpoint=Secret.from_token("https://endpoint"),
        deployment_name="deploy",
        api_version="1"
    )
    assert cfg.get_resource_url() == "https://endpoint"

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

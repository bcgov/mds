from unittest.mock import patch

import pytest
from app.pipelines.permit_condition_extraction.permit_condition_pipeline import (
    permit_condition_pipeline,
)


@pytest.fixture
def mock_config():
    with patch("app.pipelines.permit_condition_extraction.permit_condition_pipeline.config") as mock_config:
        mock_config.document_intelligence.api_key.resolve_value.return_value = "test_key"
        mock_config.document_intelligence.endpoint = "test_endpoint"
        mock_config.document_intelligence.api_version = "test_version"
        mock_config.openai.endpoint.resolve_value.return_value = "test_endpoint"
        mock_config.openai.api_version = "test_version"
        mock_config.openai.deployment_name = "test_deployment"
        mock_config.openai.api_key.resolve_value.return_value = "test_key"
        yield mock_config


def test_permit_condition_pipeline_validation_fails_without_params(mock_config):
    pipeline = permit_condition_pipeline()

    with pytest.raises(ValueError):
        pipeline._validate_input({})


def test_permit_condition_pipeline_validation_with_params(mock_config):
    pipeline = permit_condition_pipeline()
    pipeline._validate_input({"pdf_converter": {"file_path": "test.pdf"}})

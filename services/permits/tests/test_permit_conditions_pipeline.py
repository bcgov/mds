import pytest
from app.permit_conditions.pipelines.permit_condition_pipeline import (
    permit_condition_pipeline,
)


def test_permit_condition_pipeline_validation_fails_without_params():
    pipeline = permit_condition_pipeline()

    with pytest.raises(ValueError):
        pipeline._validate_input({})


def test_permit_condition_pipeline_validation_with_params():
    pipeline = permit_condition_pipeline()
    pipeline._validate_input({"pdf_converter": {"file_path": "test.pdf"}})

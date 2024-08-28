import logging
import os

import yaml
from app.permit_conditions.converters.azure_document_intelligence_converter import (
    AzureDocumentIntelligenceConverter,
)
from app.permit_conditions.converters.filter_conditions_paragraphs import (
    FilterConditionsParagraphsConverter,
)
from app.permit_conditions.converters.metadata_converter import (
    ConditionsMetadataCombiner,
)
from app.permit_conditions.converters.pdf_to_text_converter import PDFToTextConverter
from app.permit_conditions.pipelines.CachedAzureOpenAIChatGenerator import (
    CachedAzureOpenAIChatGenerator,
)
from app.permit_conditions.pipelines.PaginatedChatPromptBuilder import (
    PaginatedChatPromptBuilder,
)
from app.permit_conditions.validator.json_fixer import JSONRepair
from app.permit_conditions.validator.permit_condition_section_combiner import (
    PermitConditionSectionCombiner,
)
from app.permit_conditions.validator.permit_condition_validator import (
    PermitConditionValidator,
)
from haystack import Pipeline
from haystack.dataclasses import ChatMessage
from haystack.utils import Secret

logger = logging.getLogger(__name__)

ROOT_DIR = os.path.abspath(os.curdir)

api_key = os.environ.get("AZURE_API_KEY")
deployment_name = os.environ.get("AZURE_DEPLOYMENT_NAME")
base_url = os.environ.get("AZURE_BASE_URL")
api_version = os.environ.get("AZURE_API_VERSION")

assert api_key
assert deployment_name
assert base_url
assert api_version

with open(f"{ROOT_DIR}/app/permit_condition_prompts.yaml", "r") as file:
    prompts = yaml.safe_load(file)

system_prompt = prompts["system_prompt"]
user_prompt = prompts["user_prompt_meta_questions"]
permit_document_prompt = prompts["permit_document_prompt_meta_questions"]

assert system_prompt
assert user_prompt
assert permit_document_prompt


def permit_condition_pipeline():
    """
    This function creates and returns a pipeline for extracting permit conditions.

    Returns:
        Pipeline: The pipeline object for extracting permit conditions.
    """
    index_pipeline = Pipeline()

    pdf_converter = AzureDocumentIntelligenceConverter()

    prompt_builder = PaginatedChatPromptBuilder(
        template=[
            ChatMessage.from_system(system_prompt),
            ChatMessage.from_user(user_prompt),
            ChatMessage.from_user(permit_document_prompt),
        ]
    )

    temperature = 0.7
    max_tokens = 4096

    llm = CachedAzureOpenAIChatGenerator(
        azure_endpoint=base_url,
        api_version=api_version,
        azure_deployment=deployment_name,
        api_key=Secret.from_token(api_key),
        timeout=600,
        generation_kwargs={"temperature": temperature, "max_tokens": max_tokens},
    )

    logger.info(
        "Initialized Azure OpenAI Chat Generator with the following parameters:"
    )
    logger.info(f"Endpoint: {base_url}")
    logger.info(f"API Version: {api_version}")
    logger.info(f"Deployment: {deployment_name}")
    logger.info(f"Temperature: {temperature}")
    logger.info(f"Max Tokens: {max_tokens}")

    parse_hierarchy = PermitConditionSectionCombiner()
    filter_paragraphs = FilterConditionsParagraphsConverter()
    json_fixer = JSONRepair()

    combine_metadata = ConditionsMetadataCombiner()

    index_pipeline.add_component("pdf_converter", pdf_converter)
    index_pipeline.add_component("filter_paragraphs", filter_paragraphs)
    index_pipeline.add_component("parse_hierarchy", parse_hierarchy)
    index_pipeline.add_component("prompt_builder", prompt_builder)
    index_pipeline.add_component("llm", llm)
    index_pipeline.add_component("json_fixer", json_fixer)
    index_pipeline.add_component("combine_metadata", combine_metadata)

    index_pipeline.connect("pdf_converter.documents", "filter_paragraphs")
    index_pipeline.connect("filter_paragraphs", "parse_hierarchy")

    index_pipeline.connect(
        "pdf_converter.permit_condition_csv", "prompt_builder.documents"
    )
    index_pipeline.connect("prompt_builder", "llm")
    index_pipeline.connect("llm", "json_fixer")

    index_pipeline.connect("json_fixer.data", "combine_metadata.data")
    index_pipeline.connect("parse_hierarchy.conditions", "combine_metadata.conditions")

    return index_pipeline


def permit_condition_gpt_pipeline():
    """
    This function creates and returns a pipeline for extracting permit conditions.

    Returns:
        Pipeline: The pipeline object for extracting permit conditions.
    """
    index_pipeline = Pipeline()

    pdf_converter = PDFToTextConverter()

    prompt_builder = PaginatedChatPromptBuilder(
        template=[
            ChatMessage.from_system(system_prompt),
            ChatMessage.from_user(user_prompt),
            ChatMessage.from_user(permit_document_prompt),
        ]
    )

    temperature = 0.7
    max_tokens = 4096

    llm = CachedAzureOpenAIChatGenerator(
        azure_endpoint=base_url,
        api_version=api_version,
        azure_deployment=deployment_name,
        api_key=Secret.from_token(api_key),
        timeout=600,
        generation_kwargs={"temperature": temperature, "max_tokens": max_tokens},
    )

    json_fixer = JSONRepair()
    validator = PermitConditionValidator()

    index_pipeline.add_component("pdf_converter", pdf_converter)
    index_pipeline.add_component("prompt_builder", prompt_builder)
    index_pipeline.add_component("llm", llm)
    index_pipeline.add_component("json_fixer", json_fixer)
    index_pipeline.add_component("validator", validator)

    index_pipeline.connect("pdf_converter", "prompt_builder")
    index_pipeline.connect("prompt_builder", "llm")
    index_pipeline.connect("llm", "json_fixer")
    index_pipeline.connect("json_fixer", "validator")
    index_pipeline.connect("validator.iteration", "prompt_builder.iteration")

    return index_pipeline

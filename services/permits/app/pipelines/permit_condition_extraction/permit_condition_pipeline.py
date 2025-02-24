import logging
import os

import yaml
from app.pipelines.permit_condition_extraction.components.azure_document_intelligence_converter import (
    AzureDocumentIntelligenceConverter,
)
from app.pipelines.permit_condition_extraction.components.CachedAzureOpenAIChatGenerator import (
    CachedAzureOpenAIChatGenerator,
)
from app.pipelines.permit_condition_extraction.components.filter_conditions_paragraphs import (
    FilterConditionsParagraphsConverter,
)
from app.pipelines.permit_condition_extraction.components.json_fixer import JSONRepair
from app.pipelines.permit_condition_extraction.components.metadata_converter import (
    ConditionsMetadataCombiner,
)
from app.pipelines.permit_condition_extraction.components.PaginatedChatPromptBuilder import (
    PaginatedChatPromptBuilder,
)
from app.pipelines.permit_condition_extraction.components.permit_condition_extractor import (
    PermitConditionExtractor,
)
from app.pipelines.permit_condition_extraction.components.permit_condition_section_combiner import (
    PermitConditionSectionCombiner,
)
from app.pipelines.permit_condition_extraction.components.permit_condition_validator import (
    PermitConditionValidator,
)
from app.pipelines.permit_condition_search.config import config
from haystack import Pipeline
from haystack.dataclasses import ChatMessage
from haystack.utils import Secret

logger = logging.getLogger(__name__)

ROOT_DIR = os.path.abspath(os.curdir)

with open(f"{ROOT_DIR}/app/permit_condition_prompts.yaml", "r") as file:
    prompts = yaml.safe_load(file)

system_prompt = prompts["system_prompt"]
user_prompt = prompts["user_prompt_meta_questions"]
permit_document_prompt = prompts["permit_document_prompt_meta_questions"]
permit_condition_post_combine_validation_prompt = prompts["permit_condition_post_combine_validation_prompt"]
permit_extraction_prompt2 = prompts["permit_extraction_prompt2"]
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

    pdf_converter = AzureDocumentIntelligenceConverter(
        endpoint=config.document_intelligence.endpoint,
        api_key=config.document_intelligence.api_key,
        api_version=config.document_intelligence.api_version
    )

    prompt_builder = PaginatedChatPromptBuilder(
        template=[
            ChatMessage.from_system(system_prompt),
            ChatMessage.from_user(user_prompt),
            ChatMessage.from_user(permit_document_prompt),
        ]
    )

    temperature = 0
    max_tokens = 16384

    llm = CachedAzureOpenAIChatGenerator(
        azure_endpoint=config.openai.endpoint,
        api_version=config.openai.api_version,
        azure_deployment=config.openai.deployment_name,
        api_key=config.openai.api_key,
        timeout=600,
        generation_kwargs={"temperature": temperature, "max_tokens": max_tokens},
    )

    logger.info(
        "Initialized Azure OpenAI Chat Generator with the following parameters:"
    )
    logger.info(f"Endpoint: {config.openai.endpoint}")
    logger.info(f"API Version: {config.openai.api_version}")
    logger.info(f"Deployment: {config.openai.deployment_name}")
    logger.info(f"Temperature: {temperature}")
    logger.info(f"Max Tokens: {max_tokens}")

    parse_hierarchy = PermitConditionSectionCombiner()
    filter_paragraphs = FilterConditionsParagraphsConverter()
    json_fixer = JSONRepair()

    combine_metadata = ConditionsMetadataCombiner()
    
    extractor = PermitConditionExtractor(
        chat_generator=llm,
        template=permit_extraction_prompt2,
    )
    # Add validator component
    validator = PermitConditionValidator(
        chat_generator=llm,
        template=permit_condition_post_combine_validation_prompt,
        condition_extractor=extractor,
    )

    index_pipeline.add_component("pdf_converter", pdf_converter)
    index_pipeline.add_component("filter_paragraphs", filter_paragraphs)
    index_pipeline.add_component("parse_hierarchy", parse_hierarchy)
    index_pipeline.add_component("validator", validator)  # Add validator
    index_pipeline.add_component("prompt_builder", prompt_builder)
    index_pipeline.add_component("llm", llm)
    index_pipeline.add_component("json_fixer", json_fixer)
    index_pipeline.add_component("combine_metadata", combine_metadata)

    index_pipeline.connect("pdf_converter.documents", "filter_paragraphs")
    index_pipeline.connect("filter_paragraphs", "parse_hierarchy")

    # Insert validator between parse_hierarchy and prompt_builder
    index_pipeline.connect("parse_hierarchy.conditions", "validator.conditions")
    index_pipeline.connect("pdf_converter.documents", "validator.documents")
    index_pipeline.connect("validator.conditions", "prompt_builder.conditions")

    index_pipeline.connect("prompt_builder", "llm")
    index_pipeline.connect("llm", "json_fixer")

    index_pipeline.connect("json_fixer.data", "combine_metadata.data")
    index_pipeline.connect("validator.conditions", "combine_metadata.conditions")

    return index_pipeline

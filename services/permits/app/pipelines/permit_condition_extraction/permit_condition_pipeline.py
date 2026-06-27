import logging
import os

import yaml
from app.common.utils.feature_flags import Feature, is_feature_enabled
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
from app.pipelines.permit_condition_extraction.components.permit_condition_correction import (
    PermitConditionCorrection,
)
from app.pipelines.permit_condition_extraction.components.permit_condition_extractor import (
    PermitConditionExtractor,
)
from app.pipelines.permit_condition_extraction.components.permit_condition_section_combiner import (
    PermitConditionSectionCombiner,
)
from app.pipelines.permit_condition_search.config import config
from haystack import Pipeline
from haystack.dataclasses import ChatMessage

logger = logging.getLogger(__name__)

ROOT_DIR = os.path.abspath(os.curdir)

with open(f"{ROOT_DIR}/app/permit_condition_prompts.yaml", "r") as file:
    prompts = yaml.safe_load(file)

system_prompt = prompts["system_prompt"]
user_prompt = prompts["user_prompt_meta_questions"]
permit_document_prompt = prompts["permit_document_prompt_meta_questions"]
permit_condition_post_combine_validation_prompt = prompts[
    "permit_condition_post_combine_validation_prompt"
]
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

    doc_intelligence_key = config.document_intelligence.api_key.resolve_value()
    assert doc_intelligence_key, "Document Intelligence API key is not set"

    pdf_converter = AzureDocumentIntelligenceConverter(
        endpoint=config.document_intelligence.endpoint,
        api_key=doc_intelligence_key,
        api_version=config.document_intelligence.api_version,
    )

    # Set token limits for the model
    model_token_limit = 128000
    completion_tokens = 16384
    context_token_limit = (
        model_token_limit - completion_tokens - 1000
    )

    # Configure the prompt builder with pagination and token counting
    prompt_builder = PaginatedChatPromptBuilder(
        template=[
            ChatMessage.from_system(system_prompt),
            ChatMessage.from_user(user_prompt),
            ChatMessage.from_user(permit_document_prompt),
        ],
    )

    temperature = 0
    max_tokens = completion_tokens

    llm = CachedAzureOpenAIChatGenerator(
        azure_endpoint=config.openai.endpoint.resolve_value(),
        api_version=config.openai.api_version,
        azure_deployment=os.environ["AZURE_PERMITS_DEPLOYMENT_NAME"],
        api_key=config.openai.api_key,
        timeout=600,
        generation_kwargs={"temperature": temperature, "max_tokens": max_tokens},
        default_headers={"Authorization": f"Bearer {config.openai.api_key.resolve_value()}"},
    )

    logger.info(
        "Initialized Azure OpenAI Chat Generator with the following parameters:"
    )
    logger.info(f"Endpoint: {config.openai.endpoint}")
    logger.info(f"API Version: {config.openai.api_version}")
    logger.info(f"Deployment: {config.openai.deployment_name}")
    logger.info(f"Temperature: {temperature}")
    logger.info(f"Max Tokens: {max_tokens}")
    logger.info(f"Context Token Limit: {context_token_limit}")

    filter_paragraphs = FilterConditionsParagraphsConverter()
    parse_hierarchy = PermitConditionSectionCombiner()
    json_fixer = JSONRepair()
    combine_metadata = ConditionsMetadataCombiner()

    extractor = PermitConditionExtractor(
        chat_generator=llm,
        template=permit_extraction_prompt2,
    )
    
    index_pipeline.add_component("pdf_converter", pdf_converter)
    index_pipeline.add_component("filter_paragraphs", filter_paragraphs)
    index_pipeline.add_component("parse_hierarchy", parse_hierarchy)
    index_pipeline.add_component("prompt_builder", prompt_builder)
    index_pipeline.add_component("llm", llm)
    index_pipeline.add_component("json_fixer", json_fixer)
    index_pipeline.add_component("combine_metadata", combine_metadata)

    
    index_pipeline.connect("pdf_converter.documents", "filter_paragraphs")
    index_pipeline.connect("filter_paragraphs", "parse_hierarchy")
    
    enable_validator = is_feature_enabled(Feature.PERMIT_CONDITION_VALIDATOR)
    logger.info(f"Permit condition validator feature flag status: {enable_validator}")
    
    if enable_validator:
        logger.info("Adding validator component to pipeline")
        validator = PermitConditionCorrection(
            chat_generator=llm,
            condition_extractor=extractor,
            template=permit_condition_post_combine_validation_prompt,
        )
        
        index_pipeline.add_component("validator", validator)
        
        index_pipeline.connect("parse_hierarchy.conditions", "validator.conditions")
        index_pipeline.connect("pdf_converter.documents", "validator.documents")
        index_pipeline.connect("validator.conditions", "prompt_builder.conditions")
        index_pipeline.connect("validator.conditions", "combine_metadata.conditions")
    else:
        logger.info("Validator component not enabled - using standard flow")
        index_pipeline.connect("parse_hierarchy.conditions", "prompt_builder.conditions")
        index_pipeline.connect("parse_hierarchy.conditions", "combine_metadata.conditions")
    
    index_pipeline.connect("prompt_builder", "llm")
    index_pipeline.connect("llm", "json_fixer")
    index_pipeline.connect("json_fixer.data", "combine_metadata.data")
    
    return index_pipeline

import os
import pickle
from haystack import Pipeline
import yaml
import os
ROOT_DIR = os.path.abspath(os.curdir)
from haystack.components.generators.chat import AzureOpenAIChatGenerator
from haystack.components.builders import ChatPromptBuilder
from haystack.dataclasses import ChatMessage
from haystack.utils import Secret
from haystack import component
from typing import Optional, List
import logging
logger = logging.getLogger(__name__)

from app.permit_conditions.converters.pdf_to_html_converter import PDFToHTMLConverter
from app.permit_conditions.validator.permit_condition_validator import PermitConditionValidator
from joblib import Memory
memory = Memory('cache', verbose=0)

api_key = os.environ.get("AZURE_API_KEY")
deployment_name = os.environ.get("AZURE_DEPLOYMENT_NAME")
base_url = os.environ.get("AZURE_BASE_URL") 
api_version = os.environ.get("AZURE_API_VERSION")
assert api_key
assert deployment_name
assert base_url
assert api_version


with open(f'{ROOT_DIR}/app/permit_condition_prompts.yaml', 'r') as file:
    prompts = yaml.safe_load(file)


system_prompt = prompts['system_prompt']
user_prompt = prompts['user_prompt']
permit_document_prompt = prompts['permit_document_prompt']


@component
class CachedAzureOpenAIChatGenerator(AzureOpenAIChatGenerator):
    @component.output_types(replies=List[ChatMessage])
    def run(self, messages: List[ChatMessage], generation_kwargs = None):
        try:
            with open('app/cache.pickle', 'rb') as f:
                logger.error('Got pickle')
                return pickle.load(f)
        except Exception as e:
            logger.error('Failed pickle')
            logger.error(e)
            res = super(CachedAzureOpenAIChatGenerator, self).run(messages=messages, generation_kwargs=generation_kwargs)
            with open('app/cache.pickle', 'wb') as f:
                pickle.dump(res, f, protocol=pickle.HIGHEST_PROTOCOL)

            return res



def permit_condition_pipeline():
    index_pipeline = Pipeline()
    
    llm = CachedAzureOpenAIChatGenerator(
        azure_endpoint=base_url,
        api_version=api_version,
        azure_deployment=deployment_name,
        api_key=Secret.from_token(api_key),
        timeout=600,
        
        generation_kwargs={
            'temperature': 0,
            'max_tokens': 4096
        }
    )

    html_converter = PDFToHTMLConverter()
    prompt_builder = ChatPromptBuilder(
        template=[
            ChatMessage.from_system(system_prompt),
            ChatMessage.from_user(user_prompt),
            ChatMessage.from_user(
                permit_document_prompt
            )
        ]
    )

    validator = PermitConditionValidator()

    index_pipeline.add_component("PDFConverter", html_converter)

    index_pipeline.add_component("prompt_builder", prompt_builder)
    index_pipeline.add_component("llm", llm)
    index_pipeline.add_component("validator", validator)

    index_pipeline.connect("PDFConverter", "prompt_builder")
    index_pipeline.connect("prompt_builder.prompt", "llm.messages")

    index_pipeline.connect("llm.replies", "validator.replies")
    return index_pipeline

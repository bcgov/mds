import os
import pickle
from haystack import Pipeline,Document
from pydantic import BaseModel
import yaml
import os
import hashlib
import struct

from app.permit_conditions.pipelines.chat_data import ChatData
from app.permit_conditions.validator.json_fixer import JSONRepair
ROOT_DIR = os.path.abspath(os.curdir)
from haystack.components.generators.chat import AzureOpenAIChatGenerator
from haystack.components.builders import ChatPromptBuilder
from haystack.dataclasses import ChatMessage
from haystack.utils import Secret
from haystack import component
from typing import Optional, List
import logging
logger = logging.getLogger(__name__)
from time import sleep

from app.permit_conditions.converters.pdf_to_html_converter import PDFToHTMLConverter
from app.permit_conditions.validator.permit_condition_validator import PermitConditionValidator
from haystack.components.preprocessors import DocumentCleaner

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

def hash_messages(messages):
    hash = hashlib.sha256()
    for message in messages:
        hash.update(struct.pack('I', len(message.content)))
        hash.update(message.content.encode())

    return hash.hexdigest()


@component
class CachedAzureOpenAIChatGenerator(AzureOpenAIChatGenerator):

    def fetch_result(self, messages, generation_kwargs):
        logger.error('quering openai')
        # sleep(1)
        cache_key = hash_messages(messages)

        try:
            with open(f'app/cache/{cache_key}.pickle', 'rb') as f:
                res = {
                    **pickle.load(f),
                }

# {'model': 'gpt-4', 'index': 0, 'finish_reason': 'length', 'usage': {'completion_tokens': 4096, 'prompt_tokens': 2579, 'total_tokens': 6675}})]}

        except Exception as e:
            logger.error(e)
            res = super(CachedAzureOpenAIChatGenerator, self).run(messages=messages, generation_kwargs=generation_kwargs)

            with open(f'app/cache/{cache_key}.pickle', 'wb') as f:
                pickle.dump(res, f, protocol=pickle.HIGHEST_PROTOCOL)

        return res['replies'][0]


    @component.output_types(data=ChatData)
    def run(self, data: ChatData, generation_kwargs = None, iteration=0):
        reply = self.fetch_result(data.messages, generation_kwargs)

        content = reply.content
        completion_tokens = reply.meta['usage']['completion_tokens']
        prompt_tokens = reply.meta['usage']['prompt_tokens']
        total_tokens = reply.meta['usage']['total_tokens']

        while reply.meta['finish_reason'] == 'length' or iteration < 10:
            logger.error('Partial json generated continuing query')

            messages = data.messages + [reply, ChatMessage.from_user("Continue!")]
            reply = self.fetch_result(messages, generation_kwargs)

            # logger.error("qqqBefore")
            # logger.error(content)
            # logger.error("qqqAfter")
            content += reply.content
            # logger.error(reply.content)
            completion_tokens += reply.meta['usage']['completion_tokens']
            prompt_tokens += reply.meta['usage']['prompt_tokens']
            total_tokens += reply.meta['usage']['total_tokens']

            iteration += 1

        reply.content = content

        print('nnnnasdasd')
        if not reply.content.endswith(']'):
            reply.content += ']'

        # logger.error(reply.content)

        reply.meta['usage']['completion_tokens'] = completion_tokens
        reply.meta['usage']['prompt_tokens'] = prompt_tokens
        reply.meta['usage']['total_tokens'] = total_tokens

        return {
            'data': ChatData([reply], data.documents)
        }


@component
class PaginatedChatPromptBuilder(ChatPromptBuilder):
    @component.output_types(data=ChatData)
    def run(
        self,
        iteration: Optional[dict]=None,
        template= None,
        template_variables=None,
        **kwargs,
    ):
        logger.error('Creating prompt')
        # sleep(1)

        if iteration:
            template_variables = {
                **template_variables,
                **iteration
            }

            logger.error(template_variables)

        output = super(PaginatedChatPromptBuilder, self).run(template=template, template_variables=template_variables, **kwargs)

        logger.error(output['prompt'])
        logger.error(len(kwargs['documents']))
        return {
            'data': ChatData(output['prompt'], kwargs['documents'])
        }
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
    prompt_builder = PaginatedChatPromptBuilder(
        template=[
            ChatMessage.from_system(system_prompt),
            ChatMessage.from_user(user_prompt),
            ChatMessage.from_user(
                permit_document_prompt
            )
        ]
    )

    json_fixer = JSONRepair()

    validator = PermitConditionValidator()

    index_pipeline.add_component("PDFConverter", html_converter)
    # index_pipeline.add_component("DocumentCleaner", DocumentCleaner(remove_repeated_substrings=True))

    index_pipeline.add_component("prompt_builder", prompt_builder)
    index_pipeline.add_component("llm", llm)
    index_pipeline.add_component("json_fixer", json_fixer)
    index_pipeline.add_component("validator", validator)

    index_pipeline.connect("PDFConverter", "prompt_builder")
    # index_pipeline.connect("DocumentCleaner", "prompt_builder")
    index_pipeline.connect("prompt_builder", "llm")

    index_pipeline.connect("llm", "json_fixer")
    index_pipeline.connect("json_fixer", "validator")
    index_pipeline.connect("validator.iteration", "prompt_builder.iteration")

    # index_pipeline.draw('app/pipeline.png')
    return index_pipeline

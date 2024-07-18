
from typing import Optional, List
from haystack import component
import json
from haystack.dataclasses import ChatMessage
import json
import logging
from pydantic import BaseModel
from app.permit_conditions.pipelines.chat_data import ChatData

logger = logging.getLogger(__name__)

class ExtractionIteration(BaseModel):
    start_page: int
    last_condition_text: str

@component
class PermitConditionValidator():
    
    def __init__(self):
        # The maximum number of pages to process in a single iteration
        self.max_pages = 5

        # The number of the first page to start processing
        self.start_page = 0
        self.documents = []
        
        # The content of the last condition that was processed
        self.last_condition_text = None
    
    @component.output_types(documents=Optional[List[ChatMessage]], iteration=Optional[dict])
    def run(self, data: ChatData):
        """
        Validate the extracted permit conditions, output information about the next pages
        that needs processing if the current iteration is not the last one, otherwise return
        the conditions found.
        """

        # Parse the replies given and make sure they're valid json        
        replies = [self._parse_reply(reply) for reply in data.messages]

        # Find the content of the last condition that was processed
        # so it can be passed along to the next iteration if needed
        for reply in replies:
            content = reply.content
            if content is not None and content['condition_text'] is not None and content['condition_text'] != '':
                self.last_condition_text = f"""
                    section_title: {content.get('section_title')}
                    section_paragraph: {content.get('section_paragraph')}
                    subparagraph: {content.get('subparagraph')}
                    clause: {content.get('clause')}
                    subclause: {content.get('subclause')}

                    {content['condition_text']}
                """

        # If there are more pages to process, return the next iteration
        if self.start_page + self.max_pages < len(data.documents):
            self.start_page = self.start_page + self.max_pages

            self.documents += replies
            iter = {
                'iteration': {
                    'start_page': self.start_page,
                    'last_condition_text': self.last_condition_text,
                }
            }

            logger.error(iter)
            return iter
        else:
            # If there are no more pages to process, return the conditions found
            return {
                'documents': self.documents + replies
            }

    def _parse_reply(self, reply):
        try:
            content = json.loads(reply.content)
        except Exception as e:
            logger.error(f'Failed to parse permit condition. Content is not valid json. {e}')
            raise 

        return ChatMessage(content=content, role=reply.role, name=reply.name, meta=reply.meta)
        
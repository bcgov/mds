
from typing import Optional, List
from haystack import component, Document
import json
from haystack.dataclasses import ChatMessage
import csv
import json
from io import StringIO
import logging
from pydantic import BaseModel
from time import sleep
from app.permit_conditions.pipelines.chat_data import ChatData

logger = logging.getLogger(__name__)

class ExtractionIteration(BaseModel):
    start_page: int
    last_condition_text: str

@component
class PermitConditionValidator():

    def __init__(self):
        self.max_pages = 5
        self.start_page = 0
        self.documents = []
        self.last_condition_text = None
    
    @component.output_types(documents=Optional[List[ChatMessage]], iteration=Optional[dict])
    def run(self, data: ChatData):
        """
        Validate the extracted permit conditions.
        
        :param replies: A list of extracted permit conditions.
        
        :returns: A dictionary with the following keys:
            - `valid`: A boolean indicating whether the permit conditions are valid.
            - `errors`: A list of errors if the permit conditions are invalid.
        """
        replies = [self._parse_reply(reply) for reply in data.messages]

        csv_content = StringIO()
        writer = csv.writer(csv_content)

        for reply in replies[0].content:
            writer.writerow(reply.values())
            # print(reply)
            if reply and reply['condition_text'] and reply['condition_text'] != '':
                self.last_condition_text = f"""
                    section_title: {reply.get('section_title')}
                    section_paragraph: {reply.get('section_paragraph')}
                    subparagraph: {reply.get('subparagraph')}
                    clause: {reply.get('clause')}
                    subclause: {reply.get('subclause')}

                    {reply['condition_text']}
                """
                
        logger.error(f'Finished pages {self.start_page + 1}-{self.start_page + 1 + self.max_pages} of {len(data.documents)}')
        logger.error(f'Found {len(replies[0].content)} replies')
        logger.error(f'Last condition text: {self.last_condition_text[:100] if self.last_condition_text else None}')

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
            return {
                'documents': self.documents + replies
            }

    def _parse_reply(self, reply):
        try:
            content = json.loads(reply.content)
        except Exception as e:
            logger.error(e)
            logger.error(reply.content)
            raise e
            content = []

        return ChatMessage(content=content, role=reply.role, name=reply.name, meta=reply.meta)
        
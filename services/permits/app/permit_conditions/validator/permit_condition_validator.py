import json
import logging
import operator
import os
from functools import reduce
from typing import List, Optional

from app.permit_conditions.pipelines.chat_data import ChatData
from app.permit_conditions.validator.permit_condition_model import (
    ConditionType,
    PermitCondition,
    PermitConditions,
    PromptResponse,
    RootPromptResponse,
)
from haystack import Document, component
from haystack.dataclasses import ChatMessage
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "false").lower() == "true"


class ExtractionIteration(BaseModel):
    start_page: int
    last_condition_text: str


@component
class PermitConditionValidator:

    def __init__(self):
        # The maximum number of pages to process in a single iteration
        self.max_pages = 6

        # The number of the first page to start processing
        self.start_page = 0
        self.documents: List[PermitCondition] = []
        self.meta = None

        # The content of the last condition that was processed
        self.last_condition_text = None

    @component.output_types(
        documents=Optional[List[PromptResponse]], iteration=Optional[dict]
    )
    def run(self, data: ChatData):
        """
        Validate the extracted permit conditions, output information about the next pages
        that needs processing if the current iteration is not the last one, otherwise return
        the conditions found.
        """

        # Parse the replies given and make sure they're valid json
        conditions: List[PermitCondition] = reduce(
            operator.concat, [self._parse_reply(reply) for reply in data.messages]
        )

        # Find the content of the last condition that was processed
        # so it can be passed along to the next iteration if needed
        for condition in conditions:
            if (
                condition is not None
                and condition.condition_text is not None
                and condition.condition_text != ""
            ):
                self.last_condition_text = f"""
                    section_title: {condition.section_title}
                    section_paragraph: {condition.section_paragraph}
                    subparagraph: {condition.subparagraph}
                    clause: {condition.clause}
                    subclause: {condition.subclause}

                    {condition.condition_text}
                """

        if DEBUG_MODE:
            with open(f"debug/validator_page_{self.start_page}.json", "w") as f:
                f.write(
                    json.dumps(
                        PermitConditions(conditions=conditions).model_dump(mode="json"),
                        indent=4,
                    )
                )

        # If there are more pages to process, return the next iteration
        if self.start_page + self.max_pages < len(data.documents):
            self.start_page = self.start_page + self.max_pages

            self.documents += conditions

            iter = {
                "iteration": {
                    "start_page": self.start_page,
                    "last_condition_text": self.last_condition_text,
                }
            }

            return iter
        else:
            # If there are no more pages to process, return the conditions found
            all_replies = self.documents + conditions

            # all_replies = sorted(all_replies, key=lambda x: f"{x.section_paragraph}.{x.clause}.{x.subclause}.{x.subsubclause}")
            
            # group conditions by key (section_paragraph, clause, subclause, subsubclause)

            grouped_replies = {x.key(): x for x in all_replies}

            # for cond in all_replies:
            #     key = cond.key()
            #     parent_cond = cond.create_parent()

            #     if parent_cond.key() not in grouped_replies and parent_cond.condition_type() != ConditionType.SECTION:
            #         cond.condition_title = ''

            #         grouped_replies[parent_cond.key()] = parent_cond

            #         logger.info(f"Parent clause: {parent_cond.key()} of {key} is missing")

            #     parent = grouped_replies.get(parent_cond.key())
            #     if parent and cond and parent.condition_title == cond.condition_title:
            #         cond.condition_title = ''

            #     if parent and cond and parent.condition_text == cond.condition_text:
            #         parent.condition_text = ''
            #     if cond.section_paragraph == 'C' and cond.subparagraph == '4' and cond.clause == 'c' and cond.subclause == 'i':
            #         print('Condition 1:')
            #         print(cond.condition_title, cond.paragraph_title)
            #         print('Parent condition:')
            #         print(parent.condition_title, parent.paragraph_title)

            sorted_replies = sorted(grouped_replies.values(), key=lambda x: x.key())
            return {"conditions": PermitConditions(conditions=sorted_replies)}

    def _parse_reply(self, reply) -> List[PromptResponse]:
        try:
            content = json.loads(reply.content)

            conditions = []

            for condition in content:
                # sometimes, conditions are nested in a list in the response
                # from the pipeline, so we need to flatten them
                if isinstance(condition, list):
                    for c in condition:
                        conditions.append(c)
                else:
                    conditions.append(condition)

            actual_conditions = []
            for c in conditions:
                if 'page_number' in c and c.get('page_number') == '':
                    c['page_number'] = None
                
                has_sub_cond = False
                for key, value in c.items():
                    if isinstance(value, list):
                        for cond in value:
                            actual_conditions.append(cond)
                        has_sub_cond = True
                if not has_sub_cond:
                    actual_conditions.append(c)
            
            transformed = []

            for c in actual_conditions:
                if c.get('numbering'):
                    tp = c.get('type')
                    section = c.get('section')
                    paragraph = c.get('paragraph'),
                    subparagraph=c.get('subparagraph'),
                    clause=c.get('clause'),
                    subclause=c.get('subclause'),
                    subsubclause=c.get('subsubclause'),
                    title=c.get('title'),
                    page_number=c.get('page_number'),
                    condition_text=c.get('text'),

                    if tp == 'section':
                        section = c.get('numbering')
                    if tp == 'paragraph':
                        paragraph = c.get('numbering')
                    if tp == 'subparagraph':
                        subparagraph = c.get('numbering')
                    if tp == 'clause':
                        clause = c.get('numbering')
                    if tp == 'subclause':
                        subclause = c.get('numbering')
                    if tp == 'subsubclause':
                        subsubclause = c.get('numbering')

                    def _clean(text):
                        return text.replace('.', '').replace('(', '').replace(')', '').replace(' ', '').strip()

                    c = PermitCondition(
                        section=_clean(section),
                        paragraph=_clean(paragraph),
                        subparagraph=_clean(subparagraph),
                        clause=_clean(clause),
                        subclause=_clean(subclause),
                        subsubclause=_clean(subsubclause),
                        condition_title=title,
                        condition_text=condition_text,
                        page_number=page_number,
                    )

                    transformed.append(c)
                else:
                    transformed.append(c)

            response = PermitConditions.model_validate({"conditions": transformed})

            return response.conditions
        except Exception as e:
            logger.error(
                f"Failed to parse permit condition. Content is not valid json. {e}"
            )
            logger.error(reply.content)
            raise

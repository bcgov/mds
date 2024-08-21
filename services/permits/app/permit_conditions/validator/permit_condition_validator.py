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

def _clean(text) -> str:
    if not text:
        return ''
    if isinstance(text, str):
        return text.replace(".", "").replace("(", "").replace(")", "").replace(" ", "").strip()
    else:
        return str(text)


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
                sec_par = ", ".join(filter(None, [f"section: {condition.section}" if condition.section else None,
                f"paragraph: {condition.paragraph}" if condition.paragraph else None,
                f"subparagraph: {condition.subparagraph}" if condition.subparagraph else None,
                f"clause: {condition.clause}" if condition.clause else None,
                f"subclause: {condition.subclause}" if condition.subclause else None,
                f"subsubclause: {condition.subsubclause}" if condition.subsubclause else None]))

                self.last_condition_text = f"""
                The last condition that was extracted was found in {sec_par}, {"and had roughly the following text: \n\n" + condition.condition_text if condition.condition_text else {"and had the following title: {condition.title}" if condition.condition_title else ""}}
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

            sections = {c.section: c for c in sorted_replies if c.condition_type() == ConditionType.SECTION}

            logger.info('seeeections')
            logger.info(sections)

            for cond in sorted_replies:
                logger.info(f'{cond.section} {cond.type}')
                sec = sections.get(cond.section)
                if sec:
                    cond.section_title = sec.section_title


            return {"conditions": PermitConditions(conditions=sorted_replies)}

    def _parse_reply(self, reply) -> List[PromptResponse]:
        try:
            conditions = json.loads(reply.content)


            # for condition in content:
            #     # sometimes, conditions are nested in a list in the response
            #     # from the pipeline, so we need to flatten them
            #     if isinstance(condition, list):
            #         for c in condition:
            #             conditions.append(c)
            #     else:
            #         conditions.append(condition)

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

            flattened = []
            for c in actual_conditions:
                if isinstance(c, list):
                    flattened += c
                else:
                    flattened.append(c)

            for c in flattened:
                if isinstance(c, list):
                    raise Exception(f"Invalid condition format. Conditions should not be nested in a list. {len(c)}")
                if not isinstance(c, dict):
                    logger.info(f'Invalid condition format. Condition is not a dictionary. {c}')
                    continue
                tp = _clean(c.get('type'))
                section = _clean(c.get('section_number', ''))
                paragraph = _clean(c.get('paragraph_number', ''))
                subparagraph = _clean(c.get('subparagraph_number', ''))
                clause = _clean(c.get('clause_number', ''))
                subclause = _clean(c.get('subclause_number', ''))
                subsubclause = _clean(c.get('subsubclause_number', ''))
                title = c.get('title')
                page_number = c.get('page_number')
                condition_text = c.get('text')

                c = PermitCondition(
                    type=tp,
                    section=section,
                    paragraph=paragraph,
                    subparagraph=subparagraph,
                    clause=clause,
                    subclause=subclause,
                    subsubclause=subsubclause,
                    condition_title=title,
                    condition_text=condition_text,
                    page_number=page_number,
                )

                transformed.append(c)

            response = PermitConditions.model_validate({"conditions": transformed})

            return response.conditions
        except Exception as e:
            logger.error(
                f"Failed to parse permit condition. Content is not valid json. {e}"
            )
            logger.error(reply.content)
            raise

import json
import logging
import operator
import os
from functools import reduce
from typing import List, Optional

from app.permit_conditions.pipelines.chat_data import ChatData
from app.permit_conditions.validator.permit_condition_model import (
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
            with open(f"page_{self.start_page}.json", "w") as f:
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

            return {"conditions": PermitConditions(conditions=all_replies)}

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

            for c in conditions:
                if 'page_number' in c and c.get('page_number') == '':
                    c['page_number'] = None

            response = PermitConditions.model_validate({"conditions": conditions})

            return response.conditions
        except Exception as e:
            logger.error(
                f"Failed to parse permit condition. Content is not valid json. {e}"
            )
            logger.error(reply.content)
            raise

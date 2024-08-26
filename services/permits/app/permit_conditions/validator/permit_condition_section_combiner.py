import json
import logging
import operator
import os
import re
from functools import reduce
from typing import List, Optional

from app.permit_conditions.pipelines.chat_data import ChatData
from app.permit_conditions.validator.parse_hierarchy import parse_hierarchy
from app.permit_conditions.validator.permit_condition_model import (
    ConditionType,
    PermitCondition,
    PermitConditions,
    PromptResponse,
    RootPromptResponse,
)
from haystack import Document, component
from haystack.components.preprocessors import DocumentCleaner
from haystack.dataclasses import ChatMessage
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "false").lower() == "true"

def _clean(text) -> str:
    if not text:
        return ''
    if isinstance(text, str):
        cont = text.replace(".", "").replace("(", "").replace(")", "").replace(" ", "").strip()
        cleaner = DocumentCleaner(
        ascii_only=True,
            remove_empty_lines=True,
            remove_extra_whitespaces=True,
            remove_repeated_substrings=False)
        
        doc = cleaner.clean(Document(content=cont))

        return doc.content

    else:
        return str(text)

class ExtractionIteration(BaseModel):
    start_page: int
    last_condition_text: str


@component
class PermitConditionSectionCombiner:

    @component.output_types(
        documents=Optional[List[PromptResponse]], iteration=Optional[dict]
    )
    def run(self, documents: List[Document]):
        """
        Validate the extracted permit conditions, output information about the next pages
        that needs processing if the current iteration is not the last one, otherwise return
        the conditions found.
        """

        document_json = [
            {**json.loads(doc.content),**doc.meta, **{"meta": doc.meta}} for doc in documents[1:]
        ]

        parsed_docs = parse_hierarchy(document_json)

        if DEBUG_MODE:
            with open("debug/parsed_docs.json", "w") as f:
                f.write(json.dumps(parsed_docs, indent=4))

        conditions = []

        for p in parsed_docs:
            matching_cond = next((
                c for c in conditions if (
                    c.section == p.get("section") and
                    c.paragraph == p.get("paragraph") and
                    c.subparagraph == p.get("subparagraph") and
                    c.subclause == p.get("subclause") and
                    c.subsubclause == p.get("subsusubparagraph") and
                    c.clause == p.get("clause")
                )
            ), None)

            if matching_cond:
                # Combine the text and titles of condtions that have the same section, paragraph, etc.
                # This is the case when a condition has both a "title" and associated text. They're split into two separate paragraphs, but should really be one.
                # Example:
                # ````
                # 1. Test condition
                # The permittee should do a, b, and c.
                # ```
                # In this case, the condition is split into two paragraphs, but should be combined into one with the following props
                # 
                # Condition Title: Test condition
                # Condition Text: The permittee should do a, b, and c.
                if not matching_cond.condition_title:
                    matching_cond.condition_title = matching_cond.condition_text
                    matching_cond.condition_text = p['text']

            else:
                conditions.append(PermitCondition(
                    section=p.get('section') or '',
                    section_title='',
                    paragraph=p.get('paragraph'),
                    subparagraph=p.get('subparagraph'),
                    clause=p.get('clause'),
                    subclause=p.get('subclause'),
                    subsubclause=p.get('subsubclause'),
                    condition_title=p.get('title'),
                    condition_text=p.get('text'),
                    page_number=p.get('page_number') or 1,
                    meta=p.get('meta')
                ))
        return {"conditions": PermitConditions(conditions=conditions)}

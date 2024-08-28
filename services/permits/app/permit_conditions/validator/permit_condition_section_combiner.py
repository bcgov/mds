import json
import logging
import os
from typing import List, Optional

from app.permit_conditions.validator.parse_hierarchy import parse_hierarchy
from app.permit_conditions.validator.permit_condition_model import (
    PermitCondition,
    PermitConditions,
)
from haystack import Document, component
from pydantic import BaseModel

logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "false").lower() == "true"


class ExtractionIteration(BaseModel):
    start_page: int
    last_condition_text: str


@component
class PermitConditionSectionCombiner:

    @component.output_types(
        conditions=PermitConditions,
    )
    def run(self, documents: List[Document]):
        """
        Given a list of documents that have their numbering identified (e.g.) a, B, 1, 3, and bounding boxes identified, this step will
        use that to infer the hierarchy of the conditions. It will also combine conditions that have the same section, paragraph, etc. into one condition.

        Example input:

        [{
            "text": "This is a test.",
            "numbering": "A",
            "regex": "uppercase_letter",
        },
        {
            "text": "This is another.",
            "numbering": "1",
            "regex": "number",
        },
        {
            "text": "This is yet another test.",
            "numbering": None,
            "regex": None,
        }]

        Output:

        [
            {
                "condition_text": "This is a test.",
                "section": "A",
            },
            {
                "condition_text": "This is yet another test.",
                "condition_title": "This is another.",
                "section": "A",
                "paragraph": "1",
            }
        ]


        """
        document_json = [
            {**json.loads(doc.content), **{"meta": doc.meta}} for doc in documents
        ]

        # Infer the hierarchy of the conditions
        parsed_docs = parse_hierarchy(document_json)

        if DEBUG_MODE:
            with open("debug/parsed_docs.json", "w") as f:
                f.write(json.dumps(parsed_docs, indent=4))

        conditions = []

        # Combine conditions that have the exact same section, paragraph, etc.
        # This is the case when a condition has both a "title" and associated text. They're split into two separate paragraphs, but should really be one.
        for p in parsed_docs:
            matching_cond = next(
                (
                    c
                    for c in conditions
                    if (
                        c.section == p.get("section")
                        and c.paragraph == p.get("paragraph")
                        and c.subparagraph == p.get("subparagraph")
                        and c.subclause == p.get("subclause")
                        and c.subsubclause == p.get("subsusubparagraph")
                        and c.clause == p.get("clause")
                    )
                ),
                None,
            )

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
                    matching_cond.condition_text = p["text"]
                    matching_cond.id = p["id"]

                    if matching_cond.meta["bounding_box"] and p["meta"]["bounding_box"]:
                        matching_cond.meta["bounding_box"]["bottom"] = max(
                            matching_cond.meta["bounding_box"]["bottom"],
                            p["meta"]["bounding_box"]["bottom"],
                        )
                        matching_cond.meta["bounding_box"]["top"] = min(
                            matching_cond.meta["bounding_box"]["top"],
                            p["meta"]["bounding_box"]["top"],
                        )
                        matching_cond.meta["bounding_box"]["left"] = min(
                            matching_cond.meta["bounding_box"]["left"],
                            p["meta"]["bounding_box"]["left"],
                        )
                        matching_cond.meta["bounding_box"]["right"] = max(
                            matching_cond.meta["bounding_box"]["right"],
                            p["meta"]["bounding_box"]["right"],
                        )

                    matching_cond.meta = {**p["meta"], **matching_cond.meta}
            else:
                conditions.append(
                    PermitCondition(
                        section=p.get("section") or "",
                        section_title="",
                        paragraph=p.get("paragraph"),
                        subparagraph=p.get("subparagraph"),
                        clause=p.get("clause"),
                        subclause=p.get("subclause"),
                        subsubclause=p.get("subsubclause"),
                        condition_title=p.get("title"),
                        condition_text=p.get("text"),
                        page_number=p.get("page_number") or 1,
                        id=p.get("id"),
                        meta=p.get("meta"),
                    )
                )

        return {"conditions": PermitConditions(conditions=conditions)}

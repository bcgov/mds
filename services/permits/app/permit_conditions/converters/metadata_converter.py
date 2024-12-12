import json
import logging
import os
from typing import List

from app.permit_conditions.context import context
from app.permit_conditions.pipelines.chat_data import ChatData
from app.permit_conditions.validator.permit_condition_model import (
    PermitCondition,
    PermitConditions,
)
from haystack import component, logging

logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "false").lower() == "true"


@component
class ConditionsMetadataCombiner:
    """
    Combines answers given by GPT4 to the questions defined in our prompts
    with the permit conditions extracted from the permit document.
    Responses from GPT4 are stored in the `meta` attribute of the permit condition it relates to.
    Args:
        conditions (List[PermitCondition]): List of permit conditions.
        data (ChatData): Chat data containing messages from GPT4.
    Returns:
        List[PermitCondition]: List of permit conditions with updated metadata.
    """

    @component.output_types(conditions=List[PermitCondition])
    def run(
        self,
        conditions: PermitConditions,
        data: ChatData,
    ) -> dict:

        context.get().update_state(
            state="PROGRESS", meta={"stage": "conditions_metadata_combiner"}
        )

        docs_by_id = {doc.id: doc for doc in conditions.conditions}
        paragraphs = []

        flattened_messages = [msg for group in data.messages for msg in group]
        content = [json.loads(msg.content) for msg in flattened_messages]

        # sometimes the paragraphs are nested in the output from GPT4
        for paragraph in content:
            if "paragraphs" in paragraph:
                paragraphs.extend(paragraph["paragraphs"])
            else:
                paragraphs.append(paragraph)

        # Add questions answered by GPT4 to the metadata of the condition in the `questions` property
        for p in paragraphs:
            if p["id"] in docs_by_id:
                docs_by_id[p["id"]].meta = {
                    "questions": p["meta"],
                    **(docs_by_id[p["id"]].meta or {}),
                }
        return {"conditions": conditions}

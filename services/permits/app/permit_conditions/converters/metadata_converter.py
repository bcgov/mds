import csv
import io
import json
import logging
import os
from typing import Any, Dict, List, Optional

import pandas as pd
from app.permit_conditions.context import context
from haystack import Document, component, logging
from app.permit_conditions.validator.permit_condition_model import PermitCondition, PermitConditions
from app.permit_conditions.pipelines.chat_data import ChatData

logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "false").lower() == "true"

@component
class ConditionsMetadataCombiner:
    """
    Combines answers given by GPT4 to the questions defined in our prompts
    with the permit conditions extracted from the permit document.
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
    ) -> List[PermitCondition]:
        
        context.get().update_state(state="PROGRESS", meta={"stage": "conditions_metadata_combiner"})

        docs_by_id = {doc.id: doc for doc in conditions.conditions}

        paragraphs = []

        # Extract paragraphs from the chat data
        for msg in data.messages:
            cnt = json.loads(msg.content)

            for p in cnt['paragraphs']:
                # Sometimes the paragraphs are nesteded in the output from GPT4
                if 'paragraphs' in p:
                    for p2 in p['paragraphs']:
                        paragraphs.append(p2)
                else:
                    paragraphs.append(p)

        # Add questions answered by GPT4 to the metadata of the condition in the `questions` property
        for p in paragraphs:
            if p['id'] in docs_by_id:
                docs_by_id[p['id']].meta = {
                    'questions': p['meta'],
                    **docs_by_id[p['id']].meta
                }
        return {"conditions": conditions}

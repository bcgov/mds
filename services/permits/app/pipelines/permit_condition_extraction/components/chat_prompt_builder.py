import json
import logging
import os
from typing import List, Optional

from app.common.types.chat_data import ChatData
from app.common.types.permit_condition_model import PermitCondition, PermitConditions
from haystack import Document, component
from haystack.components.builders import ChatPromptBuilder
from haystack.dataclasses import ChatMessage

logger = logging.getLogger(__name__)
DEBUG_MODE = os.environ.get("DEBUG_MODE", "False").lower() == "true"


@component
class MDSChatPromptBuilder(object):
    """
    Component that renders chat prompts using Jinja templates for the use
    in further steps of the pipeline.

    This component extends the ChatPromptBuilder component to support pagination of the chat prompts.

    The output of this component is a list of chat prompt "groups" where each group contains a list of chat prompts related to a subset of the permit conditions.
    """

    def __init__(
            self,
            **kwargs,
    ):
        self.builder = ChatPromptBuilder(**kwargs)

    @component.output_types(data=ChatData)
    def run(
        self,
        documents: List[Document],
        **kwargs,
    ):
        docs: List[ChatMessage] = self.builder.run(
            documents=documents, **kwargs
        )['prompt']

        if DEBUG_MODE:
            with open("debug/chat_prompts.json", "w") as f:
                for doc in docs:
                    f.write(doc.text or "")
                    f.write("\n")

        return {"data": ChatData([docs], documents)}

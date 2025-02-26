import json
import logging
import os

from app.common.types.chat_data import ChatData
from haystack import component
from haystack.dataclasses import ChatMessage
from json_repair import repair_json

logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "False").lower() == "true"


@component
class JSONRepair:
    @component.output_types(data=ChatData)
    def run(self, data: ChatData):
        """
        Attempts to repair JSON strings in the messages of a ChatData object.
        The output from Azure OpenAI may not always be a 100% valid JSON string,
        this component attempts to repair the JSON if it is invalid.

        Args:
            data (ChatData): The ChatData object containing the messages to be repaired.

        Returns:
            dict: A dictionary containing the repaired ChatData object.
        """
        for i, group in enumerate(data.messages):
            data.messages[i] = [
                self._create_message_with_same_role(
                    msg,
                    json.dumps(json.loads(str(repair_json(msg.text))))
                )
                for msg in group
            ]

        if DEBUG_MODE:
            with open("debug/json_repair_output.txt", "a") as f:
                f.write(
                    json.dumps(
                        [
                            json.loads(msg.text)
                            for group in data.messages
                            for msg in group
                        ],
                        indent=4,
                    )
                )

        return {"data": data}

    def _create_message_with_same_role(self, original_msg: ChatMessage, new_text: str) -> ChatMessage:
        """Creates a new ChatMessage with the same role as the original message"""
        factory_methods = {
            "assistant": ChatMessage.from_assistant,
            "user": ChatMessage.from_user,
            "system": ChatMessage.from_system,
            "tool": ChatMessage.from_tool,
        }
        
        create_message = factory_methods.get(original_msg.role, ChatMessage.from_assistant)
        return create_message(text=new_text, meta=original_msg.meta)

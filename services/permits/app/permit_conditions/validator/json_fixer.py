import io
import json
import logging
import os

import pandas as pd
from app.permit_conditions.pipelines.chat_data import ChatData
from haystack import component
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

        for msg in data.messages:
            msg.content = json.dumps(json.loads(repair_json(msg.content)))

        
        if DEBUG_MODE:
            with open("debug/json_repair_output.txt", "a") as f:
                f.write(json.dumps([json.loads(msg.content) for msg in data.messages], indent=4))

        return {"data": data}

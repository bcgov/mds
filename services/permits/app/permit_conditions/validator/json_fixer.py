
from haystack import component
import logging
from app.permit_conditions.pipelines.chat_data import ChatData

logger = logging.getLogger(__name__)

from json_repair import repair_json

@component
class JSONRepair():
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
            msg.content = repair_json(msg.content)
        
        return {'data': data}

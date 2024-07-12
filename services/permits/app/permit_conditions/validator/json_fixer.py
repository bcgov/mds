
from haystack import component
import json
import logging
from app.permit_conditions.pipelines.chat_data import ChatData

logger = logging.getLogger(__name__)

from json_repair import repair_json

@component
class JSONRepair():
    
    @component.output_types(data=ChatData)
    def run(self, data: ChatData):
        for msg in data.messages:
            msg.content = repair_json(msg.content)
        
        return {'data': data}

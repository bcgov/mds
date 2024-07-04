
from typing import Optional, List
from haystack import component
import json
from haystack.dataclasses import ChatMessage
import csv
import json
from io import StringIO

@component
class PermitConditionValidator():
    
    @component.output_types(replies=List[ChatMessage])
    def run(self, replies: List[ChatMessage]):
        """
        Validate the extracted permit conditions.
        
        :param replies: A list of extracted permit conditions.
        
        :returns: A dictionary with the following keys:
            - `valid`: A boolean indicating whether the permit conditions are valid.
            - `errors`: A list of errors if the permit conditions are invalid.
        """
        replies = [self._parse_reply(reply) for reply in replies]

        csv_content = StringIO()
        writer = csv.writer(csv_content)

        writer.writerow(replies[0].content[0])
        for reply in replies[0].content:
            writer.writerow(reply.values())

        return {
            'documents': replies,
            'csv': csv_content.getvalue()
        }
        
    def _parse_reply(self, reply):
            content = json.loads(reply.content)

            return ChatMessage(content=content, role=reply.role, name=reply.name, meta=reply.meta)
        
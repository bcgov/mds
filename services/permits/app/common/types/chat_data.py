from dataclasses import dataclass
from typing import List

from haystack import Document
from haystack.dataclasses import ChatMessage


@dataclass
class ChatData:
    messages: List[List[ChatMessage]] # Groups of message requests and responses from Azure OpenAI. Each group corresponds to one request-response cycle.
    documents: List[Document] # Original documents that were used to generate the chat messages.

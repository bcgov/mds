from dataclasses import dataclass
from typing import List
from pydantic import BaseModel
import os
from haystack import Document
from haystack.dataclasses import ChatMessage


@dataclass
class ChatData:
    messages: List[ChatMessage]
    documents: List[Document]

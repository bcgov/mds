from enum import Enum
from typing import Any, List, Optional

from pydantic import BaseModel


class Usage(BaseModel):
    completion_tokens: int
    prompt_tokens: int
    total_tokens: int


class PromptResponseMeta(BaseModel):
    model: str
    index: int
    finish_reason: str
    usage: Usage


class PermitCondition(BaseModel):
    section: str = None
    section_title: Optional[str] = None
    paragraph: Optional[str] = None
    subparagraph: Optional[str] = None
    clause: Optional[str] = None
    subclause: Optional[str] = None
    subsubclause: Optional[str] = None
    condition_title: Optional[str] = None
    page_number: Optional[int] = None
    condition_text: Optional[str] = None
    original_condition_text: Optional[str] = None
    type: Optional[str] = None
    meta: Optional[dict] = None
    id: Optional[str] = None

    def __init__(self, /, **data: Any):
        if data.get("type") == "section":
            data["section_title"] = data.get("condition_title")

        for key in [
            "section",
            "paragraph",
            "subparagraph",
            "clause",
            "subclause",
            "subsubclause",
        ]:
            if key in data and data[key] is not None:
                data[key] = data[key].strip()

        super(PermitCondition, self).__init__(**data)


class PermitConditions(BaseModel):
    conditions: List[PermitCondition]


class PromptResponse(BaseModel):
    content: List[PermitCondition]
    role: str
    name: Optional[str] = None
    meta: PromptResponseMeta


class RootPromptResponse(BaseModel):
    responses: List[PromptResponse]

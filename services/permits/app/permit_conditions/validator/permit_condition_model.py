from typing import List, Optional

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
    section_title: str = None
    section_paragraph: str = None
    paragraph_title: str = None
    subparagraph: str = None
    clause: str = None
    subclause: str = None
    page_number: Optional[int] = None
    condition_text: str = None
    original_condition_text:Optional[str] = None


class PermitConditions(BaseModel):
    conditions: List[PermitCondition]


class PromptResponse(BaseModel):
    content: List[PermitCondition]
    role: str
    name: Optional[str] = None
    meta: PromptResponseMeta


class RootPromptResponse(BaseModel):
    responses: List[PromptResponse]

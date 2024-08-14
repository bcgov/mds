from enum import Enum
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


class ConditionType(Enum):
    SUBSUBCLAUSE = "subsubclause"
    SUBCLAUSE = "subclause"
    CLAUSE = "clause"
    SUBPARAGRAPH = "subparagraph"
    SECTION = "section"


class PermitCondition(BaseModel):
    section_title: str = None
    section_paragraph: Optional[str] = None
    condition_title: Optional[str] = None
    paragraph_title: Optional[str] = None
    subparagraph: Optional[str] = None
    clause: Optional[str] = None
    subclause: Optional[str] = None
    subsubclause: Optional[str] = None
    page_number: Optional[int] = None
    condition_text: Optional[str] = None
    original_condition_text:Optional[str] = None

    def condition_type(self):
        if self.subsubclause:
            return ConditionType.SUBSUBCLAUSE
        if self.subclause:
            return ConditionType.SUBCLAUSE
        if self.clause:
            return ConditionType.CLAUSE
        if self.subparagraph:
            return ConditionType.SUBPARAGRAPH
        if self.section_paragraph:
            return ConditionType.SECTION
    def key(self):
        if self.subsubclause:
            return f"{self.section_paragraph}.{self.subparagraph}.{self.clause}.{self.subclause}.{self.subsubclause}"
        if self.subclause:
            return f"{self.section_paragraph}.{self.subparagraph}.{self.clause}.{self.subclause}"
        if self.clause:
            return f"{self.section_paragraph}.{self.subparagraph}.{self.clause}"
        if self.subparagraph:
            return f"{self.section_paragraph}.{self.subparagraph}"
        if self.section_paragraph:
            return f"{self.section_paragraph}"
    
    def create_parent(self):
        parent_subclause = self.subclause if self.subsubclause else ''
        parent_clause = self.clause if self.subclause else ''
        parent_subparagraph = self.subparagraph if self.clause else ''
        parent_section_paragraph = self.section_paragraph if self.subparagraph else ''

        return PermitCondition(
            section_title=self.section_title,
            section_paragraph=parent_section_paragraph,
            subparagraph=parent_subparagraph,
            clause=parent_clause,
            subclause=parent_subclause,
            page_number=self.page_number,
            condition_text="",
            condition_title=self.condition_title,
        )
    
        

class PermitConditions(BaseModel):
    conditions: List[PermitCondition]


class PromptResponse(BaseModel):
    content: List[PermitCondition]
    role: str
    name: Optional[str] = None
    meta: PromptResponseMeta


class RootPromptResponse(BaseModel):
    responses: List[PromptResponse]

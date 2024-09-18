from typing import List, Optional

from pydantic import BaseModel, computed_field


class PermitConditionResult(BaseModel):
    section: Optional[str] = None
    paragraph: Optional[str] = None
    subparagraph: Optional[str] = None
    clause: Optional[str] = None
    subclause: Optional[str] = None
    subsubclause: Optional[str] = None
    condition_title: Optional[str] = None
    condition_text: str

    @computed_field
    def numbering_structure(self) -> List[str]:
        return [
            self.section or '',
            self.paragraph or '',
            self.subparagraph or '',
            self.clause or '',
            self.subclause or '',
            self.subsubclause or '',
        ]

    @computed_field
    def is_top_level_section(self) -> bool:
        # A condition is a top level section if it has a section but no other numbering
        return self.section and not self.paragraph and not self.subparagraph and not self.clause and not self.subclause and not self.subsubclause
    
    @computed_field
    def step(self) -> str:
        # Numbering is the last non-empty value in the numbering structure.
        # E.g. if the numbering structure is ['A', '1', 'a', 'i', ''], the numbering is 'i'
        return next(cond for cond in reversed(self.numbering_structure) if cond and cond != '')

class CreatePermitConditionsResult(BaseModel):
    conditions: List[PermitConditionResult]

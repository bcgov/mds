from dataclasses import dataclass
from difflib import SequenceMatcher
from enum import Enum
from typing import Dict, List, Optional

from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)


class ConditionChangeType(Enum):
    ADDED = "added"
    MODIFIED = "modified"
    UNCHANGED = "unchanged"
    MOVED = "moved"

    def __str__(self):
        return str(self.value)

    def __repr__(self):
        return str(self)


@dataclass
class ConditionComparison:
    current_condition: PermitConditions
    previous_condition: Optional[PermitConditions]
    text_similarity: float
    structure_similarity: float
    combined_score: float
    change_type: ConditionChangeType

    def to_dict(self):
        return {
            "condition_guid": str(self.current_condition.permit_condition_guid),
            "previous_condition_guid": (
                str(self.previous_condition.permit_condition_guid)
                if self.previous_condition
                else None
            ),
            "text_similarity": self.text_similarity,
            "structure_similarity": self.structure_similarity,
            "combined_score": self.combined_score,
            "change_type": str(self.change_type),
        }


SIMILARITY_SCORE_MATCH_THRESHOLD = 0.8


class PermitConditionComparer:
    def __init__(self, previous_amendment_conditions: List[PermitConditions]):
        self.previous_conditions = previous_amendment_conditions
        
        self.previous_conditions_by_step = self._index_conditions_by_step(
            previous_amendment_conditions
        )

    def compare_condition(self, condition: PermitConditions) -> ConditionComparison:
        """
        Compare a condition to previous conditions to determine if it was added, modified, moved, or unchanged.
            - A condition is considered 'unchanged' if it has the same text and same numbering structure as a previous condition.
            - A condition is considered 'modified' if it has the same numbering structure but the text matches a condition with a score > SIMILARITY_SCORE_MATCH_THRESHOLD
            - A condition is considered 'moved' if it has text that matches a condition with a score > SIMILARITY_SCORE_MATCH_THRESHOLD but the numbering structure is different
            - A condition is considered 'added' if it does not match any previous conditions with a score > SIMILARITY_SCORE_MATCH_THRESHOLD
        """
        step_path = self._get_condition_step_path(condition)

        # Try to find match by step path first
        previous_condition = self.previous_conditions_by_step.get(step_path)

        if condition.condition.endswith("and be made available at the mine site at all times."):
            print("Current condition:", condition.condition)
            print("Previous condition:", previous_condition)
            print("Parent", condition.parent_permit_condition_id)
            print("Step:", condition._step)
            if condition.parent_permit_condition:
                print("ParentStep:", condition.parent_permit_condition._step)
            print("StepPath:", step_path)
            print(self.previous_conditions_by_step)


        if previous_condition:
            text_similarity = self._calculate_text_similarity(
                condition.condition, previous_condition.condition
            )
            if condition.condition.endswith("and be made available at the mine site at all times."):
                print("Current condition:", condition.condition)
                print("Previous condition:", previous_condition.condition)
                print(text_similarity)
                print(step_path)
                print(self.previous_conditions_by_step)


            if text_similarity > SIMILARITY_SCORE_MATCH_THRESHOLD:
                return ConditionComparison(
                    current_condition=condition,
                    previous_condition=previous_condition,
                    text_similarity=text_similarity,
                    structure_similarity=1.0,
                    combined_score=(text_similarity + 1.0) / 2,
                    change_type=(
                        ConditionChangeType.MODIFIED
                        if text_similarity < 1
                        else ConditionChangeType.UNCHANGED
                    ),
                )

        # If no exact step match, look for similar text
        best_match = None
        best_score = 0

        for prev_condition in self.previous_conditions:
            text_similarity = self._calculate_text_similarity(
                condition.condition, prev_condition.condition
            )
            if (
                text_similarity > SIMILARITY_SCORE_MATCH_THRESHOLD
                and text_similarity > best_score
            ):
                best_match = prev_condition
                best_score = text_similarity

        if best_match:
            return ConditionComparison(
                current_condition=condition,
                previous_condition=best_match,
                text_similarity=best_score,
                structure_similarity=0.0,
                combined_score=best_score
                * SIMILARITY_SCORE_MATCH_THRESHOLD,  # Weight text matches lower when structure doesn't match
                change_type=ConditionChangeType.MOVED,
            )

        return ConditionComparison(
            current_condition=condition,
            previous_condition=None,
            text_similarity=0.0,
            structure_similarity=0.0,
            combined_score=0.0,
            change_type=ConditionChangeType.ADDED,
        )
    
    def compare_all_conditions(self, conditions: List[PermitConditions], step=None) -> List[ConditionComparison]:
        """Compare all conditions in a list to previous conditions"""
        comparisons = []

        for condition in conditions:
            comparison = self.compare_condition(condition)
            comparisons.append(comparison)
            
            if condition.sub_conditions:
                sub_comparison = self.compare_all_conditions(condition.sub_conditions)
                comparisons = comparisons + sub_comparison
        return comparisons

    def _index_conditions_by_step(
        self, conditions: List[PermitConditions]
    ) -> Dict[str, PermitConditions]:
        """Index conditions by their step path for quick lookup"""
        indexed = {}
        for condition in conditions:
            print(condition.condition)
            step_path = self._get_condition_step_path(condition)
            if step_path:
                indexed[step_path] = condition
        return indexed

    def _get_condition_step_path(self, condition: PermitConditions) -> str:
        """Get the full step path including parent steps"""
        steps = []
        current = condition
        while current:
            step = current._step
            if step == "" and current.parent_permit_condition:
                # If step is empty, determine it based on position in parent's sub_conditions
                parent = current.parent_permit_condition
                if parent.sub_conditions:
                    try:
                        step = f'sub_{str(parent.sub_conditions.index(current) + 1)}'
                    except ValueError:
                        step = None
            if step:
                steps = steps + [step]
            current = current.parent_permit_condition
        if condition.condition.endswith("and be made available at the mine site at all times."):
            print("Steps Steps:", steps)
        cat = condition.condition_category.description if condition.condition_category else ""
        return ".".join([str(cat)] + steps) if steps else ""

    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two text strings"""
        return SequenceMatcher(None, text1, text2).ratio()

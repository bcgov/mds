from dataclasses import dataclass
from difflib import SequenceMatcher
from enum import Enum
from typing import Dict, List, Optional, Tuple

from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)


class ConditionChangeType(Enum):
    ADDED = "added"
    MODIFIED = "modified"
    UNCHANGED = "unchanged"
    MOVED = "moved"


@dataclass
class ConditionComparison:
    current_condition: PermitConditions
    previous_condition: Optional[PermitConditions]
    text_similarity: float
    structure_similarity: float
    combined_score: float
    change_type: ConditionChangeType


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

        if previous_condition:
            text_similarity = self._calculate_text_similarity(
                condition.condition, previous_condition.condition
            )
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

    def _index_conditions_by_step(
        self, conditions: List[PermitConditions]
    ) -> Dict[str, PermitConditions]:
        """Index conditions by their step path for quick lookup"""
        indexed = {}
        for condition in conditions:
            step_path = self._get_condition_step_path(condition)
            if step_path:
                indexed[step_path] = condition
        return indexed

    def _get_condition_step_path(self, condition: PermitConditions) -> str:
        """Get the full step path including parent steps"""
        steps = []
        current = condition
        while current:
            if current._step:
                steps.insert(0, current._step)
            current = current.parent
        return ".".join(steps) if steps else ""

    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two text strings"""
        return SequenceMatcher(None, text1, text2).ratio()

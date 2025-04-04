from typing import Optional

from flask import current_app

from .models.permit_condition_result import (
    CreatePermitConditionsResult,
    PermitConditionResult,
)


class CategoryMapper:
    INDENTATION_TYPE_MAPPING = {
        0: None,
        1: "SEC",
        2: "CON", 
        3: "LIS",
        4: "LIS",
        5: "LIS"
    }

    # For conditions that don't match any category, put them in a "Terms and conditions" category

    DEFAULT_CATEGORY = "Terms and conditions"

    @classmethod
    def map_indentation_to_type(cls, condition: PermitConditionResult) -> str:
        """
        The type code is based on the indentation level of the condition
        Example: ['A', '1', 'a', 'i', ''] would have an indentation of 4 -> type code is 'LIS'
        Example: ['A', '1', '', '', ''] would have an indentation of 2 -> type code is 'CON'
        Example: ['A', '', '', '', ''] would have an indentation of 1 -> type code is 'SEC'
        """
        indentation = next(
            (i - 1 for i, x in enumerate(condition.numbering_structure) if x == ""), 0
        )
        type_code = cls.INDENTATION_TYPE_MAPPING[indentation]

        if not type_code:
            current_app.logger.error(
                f"Could not determine type code for condition {condition}"
            )

        return cls.INDENTATION_TYPE_MAPPING.get(indentation) or 'LIS'
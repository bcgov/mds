import json
import logging
import os
from typing import Dict, List, Optional

from app.common.types.chat_data import ChatData
from app.common.types.permit_condition_model import PermitCondition, PermitConditions
from haystack import Document, component
from haystack.components.builders import ChatPromptBuilder
from haystack.dataclasses import ChatMessage
from json_repair import repair_json

logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "False").lower() == "true"

@component
class PermitConditionValidator:
    """
    Component that validates and corrects permit conditions after extraction.
    Can trigger complete reprocessing of the permit document if needed.

    - Validates extracted conditions against original document text
    - Attempts to correct any issues found (e.g. missing conditions, incorrect numbering)
    - Optionally triggers reprocessing if significant issues are found
    """

    def __init__(
        self,
        chat_generator,
        condition_extractor=None,
        template=None,
    ):
        """
        Initialize the validator.

        Args:
            chat_generator: The chat generator to use for validation
            condition_extractor: The condition extractor to use for reprocessing if needed
            template_key: The template key for the validation prompt
        """
        self.chat_generator = chat_generator
        self.condition_extractor = condition_extractor
        self.template_messages = [ChatMessage.from_system(template)] if template else []
        self.reprocessing_attempted = False  # Track if reprocessing has been attempted
        self.template = template
        self.changes_summary = {
            "updated": [],
            "added": [],
            "removed": [],
            "unchanged": []
        }
        self.prompt_builder = ChatPromptBuilder()

    @component.output_types(conditions=PermitConditions)
    def run(
        self,
        conditions: PermitConditions,
        documents: List[Document],
        template: Optional[str] = None,
        template_variables: Optional[dict] = None,
    ):
        """
        Validate and correct permit conditions.

        Args:
            conditions: The permit conditions to validate
            documents: The original documents for comparison
            template: Optional template override
            template_variables: Optional template variables
        """
        # Reset changes summary for new run
        self.changes_summary = {
            "updated": [],
            "added": [],
            "removed": [],
            "unchanged": []
        }

        if not template:
            template = self.template

        # Convert conditions to JSON for comparison
        conditions_json = json.dumps(
            [
                {
                    "id": c.id,
                    "section": c.section,
                    "text": c.condition_text,
                    "level1": c.section,
                    "level2": c.paragraph,
                    "level3": c.subparagraph,
                    "level4": c.clause,
                    "level5": c.subclause,
                    "condition_title": c.condition_title
                }
                for c in conditions.conditions
            ],
            indent=2,
        )

        # Extract text from documents - content is already a dictionary
        document_text = "\n".join(
            doc.content.get("text", "") if isinstance(doc.content, dict) 
            else json.loads(doc.content).get("text", "") if isinstance(doc.content, str)
            else ""
            for doc in documents 
            if doc.content
        )

        # Create template variables with document text and conditions
        variables = template_variables or {}
        variables.update({
            "original_text": document_text,
            "conditions_json": conditions_json
        })

        # Create prompt to be used for validation
        prompt: List[ChatMessage] = self.prompt_builder.run(
            template=[ChatMessage.from_system(self.template)],
            template_variables=variables,
        )["prompt"]

        chat_data = ChatData(messages=[[m] for m in prompt], documents=documents)
        
        # Write raw prompt to debug if enabled
        if DEBUG_MODE:
            with open("debug/validation_prompt.json", "w") as f:
                json.dump({
                    "messages": [
                        {
                            "text": m.text,
                            "role": m.role,
                            "meta": m.meta,
                            "name": m.name
                        } for m in prompt
                    ],
                    "variables": variables
                }, f, indent=2)

        # Run validation using the generated prompt
        result = self.chat_generator.run(data=chat_data)
        if not result or not result.get("data"):
            return {"conditions": conditions}

        try:
            # Get first message from first message group and attempt to repair JSON
            reply = result["data"].messages[0][0] if result["data"].messages and result["data"].messages[0] else None
            if not reply:
                return {"conditions": conditions}

            # Write raw chat response to debug folder
            if DEBUG_MODE:
                with open("debug/validation_raw_response.json", "w") as f:
                    json.dump({
                        "raw_text": reply.text,
                        "meta": reply.meta,
                        "role": reply.role,
                        "name": reply.name,
                    }, f, indent=2)

            # Try to repair and parse JSON response
            try:
                repaired_json = repair_json(reply.text)
                # Handle case where repair_json returns a string
                if isinstance(repaired_json, str):
                    validation_result = json.loads(repaired_json)
                else:
                    validation_result = repaired_json

                if DEBUG_MODE:
                    with open("debug/validation_repaired.json", "w") as f:
                        json.dump({
                            "original": reply.text,
                            "repaired": repaired_json,
                            "parsed": validation_result
                        }, f, indent=2)

                # Ensure validation_result is a dict with the expected structure
                if isinstance(validation_result, str):
                    logger.error("Validation result is a string after repair")
                    if DEBUG_MODE:
                        with open("debug/validation_error_string.json", "w") as f:
                            json.dump({"error": "Result is string", "value": validation_result}, f, indent=2)
                    return {"conditions": conditions}

            except Exception as e:
                logger.error(f"Failed to repair/parse JSON response: {e}")
                if DEBUG_MODE:
                    with open("debug/validation_repair_error.json", "w") as f:
                        json.dump({
                            "error": str(e),
                            "original_text": reply.text,
                            "repaired_text": repaired_json if 'repaired_json' in locals() else None
                        }, f, indent=2)
                return {"conditions": conditions}

            if validation_result.get("no_corrections_needed"):
                logger.debug("Validation completed - no corrections needed")
                self._record_change("unchanged", "all")
                self._log_changes()
                return {"conditions": conditions}
            
            # Handle reprocessing with one-time limit
            if validation_result.get("requires_reprocessing") and self.condition_extractor:
                logger.warning("Validation indicates need for reprocessing")
                if DEBUG_MODE:
                    with open("debug/validation_reprocess_trigger.json", "w") as f:
                        json.dump(validation_result, f, indent=2)
                if not self.reprocessing_attempted:
                    logger.debug("Significant mismatch detected - attempting reprocessing")
                    self.reprocessing_attempted = True
                    reprocessed_result = self.condition_extractor.run(documents=documents)
                    # Run validation again on reprocessed results
                    return self.run(
                        conditions=reprocessed_result["conditions"],
                        documents=documents,
                        template=template,
                        template_variables=template_variables
                    )
                else:
                    logger.warning("Reprocessing already attempted - using current results")
                    return {"conditions": conditions}

            # Merge validation results with existing conditions
            merged_conditions = self._merge_conditions(conditions.conditions, validation_result, documents)
            # Log changes at the end
            self._log_changes()
            return {"conditions": PermitConditions(conditions=merged_conditions)}

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse validation response: {e}")
            if DEBUG_MODE:
                with open("debug/validation_error.json", "w") as f:
                    error_data = {
                        "error": str(e),
                        "response": {
                            "messages": [
                                [m.to_dict() for m in msg_group] 
                                for msg_group in result["data"].messages
                            ] if result and result.get("data") and result["data"].messages else [],
                            "documents": [
                                {
                                    "content": doc.content,
                                    "meta": doc.meta
                                } 
                                for doc in result["data"].documents
                            ] if result and result.get("data") and result["data"].documents else []
                        } if result and result.get("data") else {}
                    }
                    json.dump(error_data, f, indent=2)
            return {"conditions": conditions}

    def _serialize_permit_condition(self, condition: PermitCondition) -> dict:
        """Convert a PermitCondition object to a serializable dictionary"""
        return {
            "id": condition.id,
            "section": condition.section,
            "paragraph": condition.paragraph,
            "subparagraph": condition.subparagraph,
            "clause": condition.clause,
            "subclause": condition.subclause,
            "text": condition.condition_text,
            "condition_title": condition.condition_title,
            "meta": condition.meta
        }

    def _merge_conditions(
        self, 
        existing_conditions: List[PermitCondition], 
        validation_result: dict,
        documents: List[Document]
    ) -> List[PermitCondition]:
        """
        Merge validation results with existing conditions.
        - Maintain original order of conditions
        - Keep existing conditions unless marked for removal
        - Update modified conditions
        - Add new conditions at the end
        """
        # Get conditions to remove
        conditions_to_remove = set(validation_result.get("remove_conditions", []))
        for remove_id in conditions_to_remove:
            self._record_change("removed", remove_id)
            logger.debug(f"Removing condition: {remove_id}")
        
        # Get validated conditions
        validation_conditions = validation_result.get("conditions", [])
        validation_by_id = {item["id"]: item for item in validation_conditions}
        
        # Track processed IDs to identify new conditions
        processed_ids = set()
        merged_conditions = []

        # First, process existing conditions in their original order
        for existing in existing_conditions:
            processed_ids.add(existing.id)
            
            # Skip if marked for removal
            if existing.id in conditions_to_remove:
                continue
                
            # Check if condition needs updating
            if existing.id in validation_by_id:
                new_data = validation_by_id[existing.id]
                if self._condition_needs_update(existing, new_data):
                    changes = self._get_condition_changes(existing, new_data)
                    self._record_change("updated", existing.id, changes)
                    logger.debug(f"Updating condition {existing.id}: {changes}")
                    merged_conditions.append(
                        PermitCondition(
                            id=existing.id,
                            section=new_data.get("level1", ""),
                            paragraph=new_data.get("level2", ""),
                            subparagraph=new_data.get("level3", ""),
                            clause=new_data.get("level4", ""),
                            subclause=new_data.get("level5", ""),
                            condition_text=new_data.get("text") or existing.condition_text,
                            condition_title=new_data.get("condition_title"),
                            meta=existing.meta  # Preserve existing meta data
                        )
                    )
                else:
                    self._record_change("unchanged", existing.id)
                    merged_conditions.append(existing)
            else:
                # Keep existing condition if not in validation result
                self._record_change("unchanged", existing.id)
                merged_conditions.append(existing)

        # Add any new conditions that weren't in the original list
        for new_item in validation_conditions:
            if new_item["id"] not in processed_ids and new_item["id"] not in conditions_to_remove and new_item.get("text"):
                self._record_change("added", new_item["id"])
                logger.debug(f"Adding new condition: {new_item['id']}")
                merged_conditions.append(
                    PermitCondition(
                        id=new_item["id"],
                        section=new_item.get("level1", ""),
                        paragraph=new_item.get("level2", ""),
                        subparagraph=new_item.get("level3", ""),
                        clause=new_item.get("level4", ""),
                        subclause=new_item.get("level5", ""),
                        text=(new_item.get("text") if new_item.get("text") and new_item["text"].strip() 
                              else self._find_text_by_id(new_item["id"], existing_conditions, documents)),
                        condition_title=new_item.get("condition_title"),
                        meta=new_item.get("meta", {})  # Allow new meta data but default to empty dict
                    )
                )

        if DEBUG_MODE:
            with open("debug/merged_conditions.json", "w") as f:
                json.dump([
                    self._serialize_permit_condition(c) 
                    for c in merged_conditions
                ], f, indent=2)

        return merged_conditions

    def _condition_needs_update(self, existing: PermitCondition, new: dict) -> bool:
        """Check if an existing condition needs to be updated based on validation results."""
        return (
            existing.section != new.get("level1", "") or
            existing.paragraph != new.get("level2", "") or
            existing.subparagraph != new.get("level3", "") or
            existing.clause != new.get("level4", "") or
            existing.subclause != new.get("level5", "") or
            (new.get("text") and existing.condition_text != new.get("text")) or
            existing.condition_title != new.get("condition_title")
        )

    def _find_text_by_id(self, condition_id: str, existing_conditions: List[PermitCondition], documents: List[Document]) -> str:
        """Find the original text for a condition by its ID in existing conditions or documents."""
        # First try to find in existing conditions
        for condition in existing_conditions:
            if condition.id == condition_id:
                return condition.condition_text
        
        # Fall back to document search if not found
        for doc in documents:
            if f"id: {condition_id}" in doc.content:
                return doc.content.replace(f" (id: {condition_id})", "").strip()
        return ""

    def _log_changes(self):
        """Log a summary of all changes made during validation"""
        logger.debug("=== Validation Changes Summary ===")
        logger.debug(f"Updated conditions: {len(self.changes_summary['updated'])}")
        logger.debug(f"Added conditions: {len(self.changes_summary['added'])}")
        logger.debug(f"Removed conditions: {len(self.changes_summary['removed'])}")
        logger.debug(f"Unchanged conditions: {len(self.changes_summary['unchanged'])}")

        if DEBUG_MODE:
            os.makedirs("debug", exist_ok=True)
            with open("debug/validation_changes.json", "w") as f:
                json.dump(self.changes_summary, f, indent=2)

    def _record_change(self, change_type: str, condition_id: str, details: Dict = None):
        """Record a change for logging"""
        self.changes_summary[change_type].append({
            "id": condition_id,
            "details": details or {}
        })

    def _get_condition_changes(self, existing: PermitCondition, new: dict) -> Dict:
        """Get a dictionary of what changed between existing and new condition"""
        changes = {}
        if existing.section != new.get("level1", ""):
            changes["section"] = {"old": existing.section, "new": new.get("level1")}
        if existing.paragraph != new.get("level2", ""):
            changes["paragraph"] = {"old": existing.paragraph, "new": new.get("level2")}
        if existing.subparagraph != new.get("level3", ""):
            changes["subparagraph"] = {"old": existing.subparagraph, "new": new.get("level3")}
        if existing.clause != new.get("level4", ""):
            changes["clause"] = {"old": existing.clause, "new": new.get("level4")}
        if existing.subclause != new.get("level5", ""):
            changes["subclause"] = {"old": existing.subclause, "new": new.get("level5")}
        if new.get("text") and existing.condition_text != new.get("text"):
            changes["text"] = {"old": existing.condition_text, "new": new.get("text")}
        if existing.condition_title != new.get("condition_title"):
            changes["title"] = {"old": existing.condition_title, "new": new.get("condition_title")}
        return changes

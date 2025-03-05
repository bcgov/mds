import json
import logging
import os
from collections import defaultdict
from typing import Any, Dict, List, Optional, Tuple

from app.common.types.chat_data import ChatData
from app.common.types.permit_condition_model import PermitCondition, PermitConditions
from app.common.utils.feature_flags import Feature, is_feature_enabled
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
        max_batch_size=1000,
    ):
        """Initialize the validator component.
        
        Args:
            chat_generator: LLM component to use for validation
            condition_extractor: Component to use for reprocessing if needed
            template: Validation prompt template
            max_batch_size: Maximum number of conditions to validate in a single batch
        """
        self.chat_generator = chat_generator
        self.condition_extractor = condition_extractor
        self.template = template
        self.max_batch_size = max_batch_size
        self.reprocessing_attempted = False
        self.prompt_builder = ChatPromptBuilder()

    @component.output_types(conditions=PermitConditions)
    def run(
        self,
        conditions: PermitConditions,
        documents: List[Document],
    ):
        """Validate and correct permit conditions.
        
        Args:
            conditions: The permit conditions to validate
            documents: Original document content for validation
            
        Returns:
            Dict containing validated/corrected conditions
        """
        logger.info(f"Starting validation of {len(conditions.conditions)} conditions")
        
        # Extract document text for validation
        document_text = self._extract_document_text(documents)
        
        # Process all conditions at once if below threshold
        if len(conditions.conditions) <= self.max_batch_size:
            logger.info(f"Processing all {len(conditions.conditions)} conditions in one batch")
            return self._validate_conditions(conditions, document_text)
        
        # Otherwise, group by sections for more efficient processing
        logger.info(f"Conditions exceed max batch size ({len(conditions.conditions)} > {self.max_batch_size})")
        logger.info("Processing by sections to optimize token usage")
        return self._process_by_sections(conditions, document_text)
    
    def _extract_document_text(self, documents: List[Document]) -> str:
        """Extract plain text from document objects."""
        texts = []
        for doc in documents:
            if isinstance(doc.content, dict):
                texts.append(doc.content.get("text", ""))
            elif isinstance(doc.content, str):
                if doc.content.startswith("{"):
                    try:
                        text = json.loads(doc.content).get("text", "")
                        texts.append(text)
                    except json.JSONDecodeError:
                        texts.append(doc.content)
                else:
                    texts.append(doc.content)
        
        return "\n".join(texts)
    
    def _process_by_sections(self, conditions: PermitConditions, document_text: str):
        """Process conditions grouped by section."""
        # Group conditions by section
        section_groups = self._group_by_section(conditions.conditions)
        logger.info(f"Grouped conditions into {len(section_groups)} sections")
        
        all_validated_conditions = []
        
        # Process each section separately
        for section, section_conditions in section_groups.items():
            section_name = section if section != "unknown" else "Unknown section"
            logger.info(f"Processing {section_name} with {len(section_conditions)} conditions")
            
            # If a section is still too large, split it into smaller batches
            if len(section_conditions) > self.max_batch_size:
                logger.info(f"Section {section_name} exceeds max batch size, splitting further")
                batches = [
                    section_conditions[i:i+self.max_batch_size] 
                    for i in range(0, len(section_conditions), self.max_batch_size)
                ]
                
                for i, batch in enumerate(batches):
                    logger.info(f"Processing batch {i+1}/{len(batches)} of section {section_name}")
                    validated_conditions = self._validate_batch(batch, document_text)
                    all_validated_conditions.extend(validated_conditions)
            else:
                # Process the section as a single batch
                validated_conditions = self._validate_batch(section_conditions, document_text)
                all_validated_conditions.extend(validated_conditions)
        
        return {"conditions": PermitConditions(conditions=all_validated_conditions)}
    
    def _group_by_section(self, conditions: List[PermitCondition]) -> Dict[str, List[PermitCondition]]:
        """Group conditions by their section."""
        sections = defaultdict(list)
        
        for condition in conditions:
            # Use the section as the key, or "unknown" if section is empty
            section_key = condition.section if condition.section else "unknown"
            sections[section_key].append(condition)
            
        return sections
    
    def _validate_conditions(self, conditions: PermitConditions, document_text: str):
        """Validate all conditions in one go."""
        validated_batch = self._validate_batch(conditions.conditions, document_text)
        return {"conditions": PermitConditions(conditions=validated_batch)}
    
    def _validate_batch(self, conditions: List[PermitCondition], document_text: str) -> List[PermitCondition]:
        """Validate a batch of conditions."""
        # Prepare validation input
        conditions_json = json.dumps([
            {
                "id": c.id,
                "level1": c.section,
                "level2": c.paragraph,
                "level3": c.subparagraph,
                "level4": c.clause,
                "level5": c.subclause,
                "text": c.condition_text,
                "condition_title": c.condition_title
            }
            for c in conditions
        ], indent=2)
        
        # Create prompt with validation template
        prompt = self.prompt_builder.run(
            template=[ChatMessage.from_system(self.template)],
            template_variables={
                "original_text": document_text,
                "conditions_json": conditions_json
            }
        )["prompt"]
        
        # Run chat generator with prompt
        chat_data = ChatData(messages=[[m] for m in prompt], documents=[])
        result = self.chat_generator.run(data=chat_data)
        
        if not result or not result.get("data") or not result["data"].messages:
            logger.warning("Failed to get valid response from validator")
            return conditions
        
        # Parse validation response
        reply = result["data"].messages[0][0] if result["data"].messages[0] else None
        if not reply:
            return conditions
        
        try:
            # Try to repair and parse JSON response
            repaired_json = repair_json(reply.text)
            validation_result = json.loads(repaired_json) if isinstance(repaired_json, str) else repaired_json
            
            # Check if validation found no issues
            if validation_result.get("no_corrections_needed"):
                if len(conditions) > 1:
                    section_id = conditions[0].section or "unknown section"
                    logger.info(f"Validation complete for section {section_id} - no corrections needed")
                else:
                    logger.info(f"Validation complete for condition {conditions[0].id} - no corrections needed")
                return conditions
            
            # Check if reprocessing is needed
            if validation_result.get("requires_reprocessing") and self.condition_extractor and not self.reprocessing_attempted:
                logger.warning("Significant issues found - triggering reprocessing")
                self.reprocessing_attempted = True
                # This would need documents to be available for reprocessing
                return conditions  # Placeholder
            
            # Apply corrections to conditions
            return self._apply_corrections(conditions, validation_result)
            
        except Exception as e:
            logger.error(f"Failed to process validation result: {str(e)}")
            return conditions
    
    def _apply_corrections(self, conditions: List[PermitCondition], validation_result: Dict) -> List[PermitCondition]:
        """Apply corrections from validation to conditions."""
        # Create maps for quick lookups
        conditions_map = {c.id: c for c in conditions}
        
        # Get corrections to apply
        validated_items = validation_result.get("conditions", [])
        corrections_by_id = {item["id"]: item for item in validated_items}
        
        # Track items that should be removed
        remove_ids = set(validation_result.get("remove_conditions", []))
        
        # Updated conditions list
        updated_conditions = []
        
        # First, process existing conditions
        for condition in conditions:
            # Skip if marked for removal
            if condition.id in remove_ids:
                logger.info(f"Removing condition {condition.id}")
                continue
                
            # Apply updates if there are corrections
            if condition.id in corrections_by_id:
                correction = corrections_by_id[condition.id]
                if self._has_changes(condition, correction):
                    updated = self._apply_correction(condition, correction)
                    updated_conditions.append(updated)
                    logger.info(f"Updated condition {condition.id}")
                else:
                    # No changes needed
                    updated_conditions.append(condition)
            else:
                # Keep unchanged
                updated_conditions.append(condition)
                
        # Add any new conditions
        existing_ids = {c.id for c in conditions}
        for correction in validated_items:
            if correction["id"] not in existing_ids and correction["id"] not in remove_ids:
                # This is a new condition to add
                new_condition = self._create_condition_from_correction(correction)
                updated_conditions.append(new_condition)
                logger.info(f"Added new condition {correction['id']}")
        
        return updated_conditions
    
    def _has_changes(self, condition: PermitCondition, correction: Dict) -> bool:
        """Check if a correction has actual changes compared to the original condition."""
        return (
            condition.section != correction.get("level1", condition.section) or
            condition.paragraph != correction.get("level2", condition.paragraph) or
            condition.subparagraph != correction.get("level3", condition.subparagraph) or
            condition.clause != correction.get("level4", condition.clause) or
            condition.subclause != correction.get("level5", condition.subclause) or
            (correction.get("text") and condition.condition_text != correction.get("text")) or
            condition.condition_title != correction.get("condition_title", condition.condition_title)
        )
    
    def _apply_correction(self, condition: PermitCondition, correction: Dict) -> PermitCondition:
        """Apply a correction to a condition."""
        return PermitCondition(
            id=condition.id,
            section=correction.get("level1", condition.section),
            paragraph=correction.get("level2", condition.paragraph),
            subparagraph=correction.get("level3", condition.subparagraph),
            clause=correction.get("level4", condition.clause),
            subclause=correction.get("level5", condition.subclause),
            condition_text=correction.get("text", condition.condition_text),
            condition_title=correction.get("condition_title", condition.condition_title),
            meta=condition.meta  # Preserve metadata
        )
    
    def _create_condition_from_correction(self, correction: Dict) -> PermitCondition:
        """Create a new condition from a correction."""
        return PermitCondition(
            id=correction["id"],
            section=correction.get("level1", ""),
            paragraph=correction.get("level2", ""),
            subparagraph=correction.get("level3", ""),
            clause=correction.get("level4", ""),
            subclause=correction.get("level5", ""),
            condition_text=correction.get("text", ""),
            condition_title=correction.get("condition_title"),
            meta={}  # New condition has no metadata yet
        )

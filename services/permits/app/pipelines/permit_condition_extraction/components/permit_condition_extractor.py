import json
import logging
import os
from typing import List, Optional

from app.common.types.chat_data import ChatData
from app.common.types.permit_condition_model import PermitCondition, PermitConditions
from haystack import Document, component
from haystack.components.builders import (
    ChatPromptBuilder,
    PromptBuilder,
    prompt_builder,
)
from haystack.dataclasses import ChatMessage

logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "False").lower() == "true"

@component
class PermitConditionExtractor:
    """
    Component that extracts permit conditions from documents using the OpenAI chat generator.
    """

    def __init__(self, chat_generator, validator=None, template=None):
        """
        Initialize the PermitConditionExtractor.

        Args:
            chat_generator: The chat generator component to use
            validator: Optional validator component for validation step
        """
        self.chat_generator = chat_generator
        self.validator = validator
        self.template = template
        self.docs_with_meta = {}

    @component.output_types(conditions=PermitConditions)
    def run(
        self,
        documents: List[Document],
        template: Optional[str] = None,
        template_variables: Optional[dict] = None,
    ):
        """
        Run the permit condition extraction.

        Args:
            documents: List of documents from the document intelligence converter
            template: Optional template override
            template_variables: Optional template variables

        Returns:
            PermitConditions object containing the extracted conditions
        """
        # Store original document metadata

        parsed_docs = []
        self.docs_with_meta = []

        for doc in documents:
            doc_js = doc.content if isinstance(doc.content, dict) else json.loads(doc.content)
            parsed_docs.append(doc_js)
            self.docs_with_meta.append({doc.id: doc.meta})
        self.docs_with_meta = {doc.id: doc.meta for doc in documents}

        logger.info(self.docs_with_meta)

        docs_to_extract_from = []

        for doc in parsed_docs:
            logger.info(self.docs_with_meta[doc['id']])
            bb = self.docs_with_meta[doc['id']].get('bounding_box', {})
            # Get indentation from meta data and apply it to the text
            left_indent = bb.get('left', 0)
            indented_text = " " * int(left_indent * 10) + doc['text']
            text = f"{indented_text} (id: {doc['id']})"
            docs_to_extract_from.append(Document(content=text))

        prompt: List[ChatMessage] = ChatPromptBuilder(template=[ChatMessage.from_system(template or self.template)]).run(template_variables={"documents": docs_to_extract_from})["prompt"]

        # Write prompt to debug folder if enabled
        if DEBUG_MODE:
            os.makedirs("debug", exist_ok=True)
            with open("debug/extractor_prompt.json", "w") as f:
                f.write("\n".join([msg.text for msg in prompt]))

        # Create ChatData object for generator
        chat_data = ChatData(messages=[prompt], documents=documents)

        # Generate response from chat model
        result = self.chat_generator.run(data=chat_data)

        # Write raw response to debug folder if enabled
        if DEBUG_MODE and result and result.get("data"):
            with open("debug/extractor_response.json", "w") as f:
                reply = result["data"].messages[0][0] if result["data"].messages and result["data"].messages[0] else None
                if reply:
                    f.write(reply.text)


        if not result or not result.get("data"):
            return {"conditions": PermitConditions(conditions=[])}


        try:
            # Get first message from first message group
            reply = result["data"].messages[0][0] if result["data"].messages and result["data"].messages[0] else None
            if not reply:
                return {"conditions": PermitConditions(conditions=[])}

            # Parse the JSON response
            conditions_data = json.loads(reply.text)
            conditions = []

            # Convert the flat JSON structure into hierarchical PermitCondition objects
            for item in conditions_data:
                meta, text = self._find_text_by_id(item["id"], parsed_docs)

                condition = PermitCondition(
                    id=item["id"],
                    section=item["level1"] if item["level1"] else "",
                    paragraph=item["level2"] if item["level2"] else "",
                    subparagraph=item["level3"] if item["level3"] else "",
                    clause=item["level4"] if item["level4"] else "",
                    subclause=item["level5"] if item["level5"] else "",
                    condition_text=text,
                    meta=meta
                )
                conditions.append(condition)
                
            # Write parsed conditions to debug folder if enabled
            if DEBUG_MODE:
                with open("debug/extraction_conditions.json", "w") as f:
                    json.dump([c.dict() for c in conditions], f, indent=2)

            # Add validation step if validator is configured
            if self.validator and conditions:
                validation_result = self.validator.run(
                    conditions=PermitConditions(conditions=conditions),
                    documents=documents
                )
                return validation_result

            return {"conditions": PermitConditions(conditions=conditions)}

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            raise

    def _find_text_by_id(self, condition_id: str, documents) -> tuple[dict, str]:
        """
        Find the original text for a condition by its ID in the documents.

        Args:
            condition_id: The ID of the condition to find
            documents: List of documents to search

        Returns:
            Tuple of (metadata dict, text string)
        """
        for doc in documents:
            if condition_id == doc.get("id"):
                return self.docs_with_meta.get(condition_id, {}), doc['text']
        return {}, ""

import json
import logging
import os
from typing import List, Optional

from app.common.types.chat_data import ChatData
from app.common.types.permit_condition_model import PermitCondition, PermitConditions
from haystack import Document, component
from haystack.components.builders import ChatPromptBuilder
from haystack.dataclasses import ChatMessage

logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "False").lower() == "true"

@component
class PermitConditionExtractor:
    """
    Component that extracts permit conditions from documents using the OpenAI chat generator.

    This is intended as a fallback for documents that do not have structured permit conditions.
    """

    def __init__(self, chat_generator, validator=None, template=None):
        """
        Initialize the PermitConditionExtractor.

        Args:
            chat_generator: The chat generator component to use
            validator: Optional validator component for validation step
            template: Optional template to use for the chat prompt
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
        docs_to_extract_from = self._prepare_documents(documents)
        reply = self._generate_chat_response(docs_to_extract_from, documents, template)

        if not reply:
            return {"conditions": PermitConditions(conditions=[])}

        try:
            conditions_data = json.loads(reply.text)
            conditions = self._create_permit_conditions(conditions_data, documents)

            if DEBUG_MODE:
                with open("debug/extraction_conditions.json", "w") as f:
                    json.dump([c.dict() for c in conditions], f, indent=2)

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

    def _prepare_documents(self, documents: List[Document]) -> List[Document]:
        """Parse and prepare documents for extraction."""
        parsed_docs = []
        self.docs_with_meta = {doc.id: doc.meta for doc in documents}
    
        for doc in documents:
            doc_js = doc.content if isinstance(doc.content, dict) else json.loads(doc.content)
            logger.info(self.docs_with_meta[doc.id])  # Changed from doc['id'] to doc.id
            bb = self.docs_with_meta[doc.id].get('bounding_box', {})
            left_indent = bb.get('left', 0)
            indented_text = " " * int(left_indent * 10) + doc_js['text']
            text = f"{indented_text} (id: {doc_js['id']})"
            parsed_docs.append(Document(content=text))
            
        return parsed_docs

    def _generate_chat_response(self, docs_to_extract_from: List[Document], documents: List[Document], template: Optional[str]) -> Optional[ChatMessage]:
        """Generate and process chat response."""
        prompt = ChatPromptBuilder(template=[
            ChatMessage.from_system(template or self.template)
        ]).run(template_variables={"documents": docs_to_extract_from})["prompt"]

        if DEBUG_MODE:
            with open("debug/extractor_prompt.json", "w") as f:
                f.write("\n".join([msg.text for msg in prompt]))

        chat_data = ChatData(messages=[prompt], documents=documents)
        result = self.chat_generator.run(data=chat_data)

        if DEBUG_MODE and result and result.get("data"):
            with open("debug/extractor_response.json", "w") as f:
                reply = result["data"].messages[0][0] if result["data"].messages and result["data"].messages[0] else None
                if reply:
                    f.write(reply.text)

        if not result or not result.get("data") or not result["data"].messages or not result["data"].messages[0]:
            return None
        
        return result["data"].messages[0][0]

    def _create_permit_conditions(self, conditions_data: List[dict], documents: List[Document]) -> List[PermitCondition]:
        """Create permit conditions from parsed data."""
        conditions = []
        parsed_docs = [
            doc.content if isinstance(doc.content, dict) else json.loads(doc.content)
            for doc in documents
        ]

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
            
        return conditions

    def _find_text_by_id(self, condition_id: str, documents) -> tuple[dict, str]:
        for doc in documents:
            if condition_id == doc.get("id"):
                return self.docs_with_meta.get(condition_id, {}), doc['text']
        return {}, ""

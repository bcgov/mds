from typing import List, Optional

from haystack import Document, component

from app.permit_conditions.pipelines.response_data import ResponseData
from app.permit_conditions.validator.permit_condition_model import PermitCondition, PromptResponse


@component
class CachedDocumentBuilder:

    @component.output_types(documents=List[Document])
    def run(self, conditions: ResponseData = None):
        document_list = []
        if conditions.content:
            document = Document(content=conditions.content, meta={"cache_key": conditions.cache_key})
            document_list.append(document)

        return {"documents": document_list}






from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class SearchParams(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None


class SearchDocumentResponse(BaseModel):
    id: str
    content: Optional[str]
    meta: Dict[str, Any]
    score: Optional[float]


class SearchPromptResponse(BaseModel):
    answers: List[str]


class Facet(BaseModel):
    value: str
    count: int


class SearchResponse(BaseModel):
    documents: List[SearchDocumentResponse]
    prompt: Optional[SearchPromptResponse]
    facets: Optional[Dict[str, List[Facet]]]


class IndexStats(BaseModel):
    document_count: Optional[int] = None
    success_count: Optional[int] = None
    error_count: Optional[int] = None


class IndexingResponse(BaseModel):
    id: str
    status: str
    stats: Optional[IndexStats] = None

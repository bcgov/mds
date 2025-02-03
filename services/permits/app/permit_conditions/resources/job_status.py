
from typing import Optional

from pydantic import BaseModel


class JobStatus(BaseModel):
    id: str
    status: str
    meta: Optional[dict] = None


class InProgressJobStatusResponse(BaseModel):
    detail: str
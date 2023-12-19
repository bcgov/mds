
from enum import Enum


class DocumentUploadStatus(Enum):
    IN_PROGRESS='In Progress'
    SUCCESS='Success'

    def __str__(self):
        return self.value

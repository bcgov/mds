from typing import List, Optional
from pydantic import BaseModel, Field
from .codes import EvidenceFormat, EncryptionMethod


class Evidence(BaseModel):
    format: EvidenceFormat
    credentialReference: Optional[str] = None


class Identifier(BaseModel):
    #https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential#identifier
    scheme: str              # AnyUrl
    identifierValue: str
    identifierURI: str       # AnyUrl
    verificationEvidence: Optional[Evidence] = None


class Party(BaseModel):
    identifiers: Optional[List[Identifier]] = []
    name: Optional[str] = None


class BinaryFile(BaseModel):
    fileHash: str
    fileLocation: str        # AnyUrl
    fileType: str            # Mimetype
    encryption_method: EncryptionMethod


class Authority(BaseModel):
    number: str
    authorityEvidence: Evidence
    trustmark: BinaryFile
    authority: Party


class Status(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#status
    pass


class Measure(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#measure
    value: float
    unit: str = Field(max_length="3")            # from https://vocabulary.uncefact.org/UnitMeasureCode

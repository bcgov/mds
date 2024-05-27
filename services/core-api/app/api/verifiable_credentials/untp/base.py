from typing import List
from pydantic import BaseModel, AnyUrl, Field
from .codes import EvidenceFormat, UnitOfMeasure, MimeType, EncryptionMethod


class Evidence(BaseModel):
    format: EvidenceFormat
    credential_reference: AnyUrl


class Identifier(BaseModel):
    scheme: AnyUrl
    identifier_value: str
    identifer_URI: AnyUrl
    verification_evidence: Evidence


class Party(BaseModel):
    identifiers: List[Identifier]
    name: str


class BinaryFile(BaseModel):
    fileHash: str
    fileLocation: AnyUrl
    fileType: MimeType
    encryption_method: EncryptionMethod


class Authority(BaseModel):
    number: str
    authority_evidence: Evidence
    trustmark: BinaryFile
    authority: Party


class Status(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#status
    pass


class Measure(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#measure
    value: float
    unit: str = Field(max_length="3")            # from https://vocabulary.uncefact.org/UnitMeasureCode

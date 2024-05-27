from typing import List
from datetime import datetime
from pydantic import BaseModel, AnyUrl

from .codes import AssessorAssuranceCode, AssessmentAssuranceCode, AttestationType, MimeType, EncryptionMethod, SustainabilityTopic
from .base import Party, Authority, Status, Identifier, Measure, BinaryFile


class Classification(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#classification
    scheme: AnyUrl
    classifierValue: str
    classifierName: str
    classifierURL: AnyUrl


class Standard(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#standard
    id: AnyUrl
    name: str
    issuingBody: Party
    issueDate: datetime


class Regulation(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#regulation
    id: AnyUrl
    name: str
    issuingBody: Party
    effectiveDate: datetime


class Metric(BaseModel):
    name: str
    value: Measure
    minimumValue: Measure
    maximumValue: Measure


class Criterion(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#criteria
    id: AnyUrl
    threshold: Metric
    name: str


class Indicator(BaseModel):
    pass


class Facility(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#product
    identifiers: List[Identifier]
    name: str
    classifications: List[Classification]
    geolocation: AnyUrl
    verifiedByCAB: Indicator


class Product(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#product
    identifiers: List[Identifier]
    marking: str
    name: str
    classifications: Classification
    testedBatchId: AnyUrl
    verifiedByCAB: Indicator


class ConformityAssessment(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#conformityattestation
    referenceStandard: Standard
    referenceRegulation: Regulation
    assessmentCriterion: Criterion
    subjectProducts: List[Product]
    subjectFacilities: List[Facility]
    measuredResults: List[Metric]
    complaince: Indicator
    sustainabilityTopic: SustainabilityTopic


class ConformityAssessmentScheme(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#conformityattestation
    id: AnyUrl
    name: str
    trustmark: BinaryFile
    issuingBody: Party
    dateOfIssue: datetime


class ConformityEvidence(BaseModel):
    evidenceRootHash: str    #md5 hash
    description: str
    evidenceFiles: List[BinaryFile]
    decryptionKeyRequest: AnyUrl


class ConformityAttestation(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#conformityattestation
    id: AnyUrl
    assessorLevel: AssessorAssuranceCode
    assessmentLevel: AssessmentAssuranceCode
    type: AttestationType
    description: str
    scope: ConformityAssessmentScheme
    issuedBy: Party
    issuedTo: Party
    validFrom: datetime
    validTo: datetime
    status: Status
    assessments: List[ConformityAssessment]
    evidence: ConformityEvidence
    accreditation: Authority
    regulatoryApproval: Authority
    certificate: BinaryFile

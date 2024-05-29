from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from .codes import AssessorAssuranceCode, AssessmentAssuranceCode, AttestationType, SustainabilityTopic
from .base import Party, Authority, Status, Identifier, Measure, BinaryFile


class Classification(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#classification
    scheme: str              # str #AnyUrl
    classifierValue: str
    classifierName: str
    classifierURL: str       # str #AnyUrl


class Standard(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#standard
    id: str                  # str #AnyUrl
    name: str
    issuingBody: Party
    issueDate: str           #iso8601 datetime string


class Regulation(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#regulation
    id: str   # str #AnyUrl
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
    id: str   # str #AnyUrl
    threshold: Metric
    name: str


class Indicator(BaseModel):
    pass


class Facility(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#product
    identifiers: List[Identifier]
    name: str
    classifications: List[Classification]
    geolocation: str         # str #AnyUrl
    verifiedByCAB: Indicator


class Product(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#product
    identifiers: List[Identifier]
    marking: str
    name: str
    classifications: Classification
    testedBatchId: str       # str #AnyUrl
    verifiedByCAB: Indicator


class ConformityAssessment(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#conformityattestation
    referenceStandard: Standard
    # referenceRegulation: Regulation
    # assessmentCriterion: Criterion
    # subjectProducts: List[Product]
    # subjectFacilities: List[Facility]
    # measuredResults: List[Metric]
    # complaince: Indicator
    # sustainabilityTopic: SustainabilityTopic


class ConformityAssessmentScheme(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#conformityattestation
    id: str   # str #AnyUrl
    name: str
    trustmark: Optional[BinaryFile] = None
    issuingBody: Optional[Party] = None
    dateOfIssue: Optional[datetime] = None


class ConformityEvidence(BaseModel):
    evidenceRootHash: str                        #md5 hash
    description: str
    evidenceFiles: List[BinaryFile]
    decryptionKeyRequest: str                    # str #AnyUrl


class ConformityAttestation(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#conformityattestation
    id: str                  #AnyUrl
    assessorLevel: Optional[AssessorAssuranceCode] = None
    assessmentLevel: AssessmentAssuranceCode
    type: AttestationType
    description: str
    scope: ConformityAssessmentScheme
    issuedBy: Party
    issuedTo: Party
    validFrom: str           #iso8601 datetime string
    validTo: Optional[datetime] = None
    status: Optional[Status] = None
    assessments: List[ConformityAssessment]
    evidence: Optional[List[ConformityEvidence]] = []
    accreditation: Optional[Authority] = None
    regulatoryApproval: Optional[Authority] = None
    certificate: Optional[BinaryFile] = None

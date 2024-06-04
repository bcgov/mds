from typing import List, Optional
from pydantic import BaseModel
from .codes import AssessorAssuranceCode, AssessmentAssuranceCode, AttestationType, SustainabilityTopic
from .base import Party, Authority, Status, Identifier, Measure, BinaryFile


class Classification(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#classification
    scheme: str                                  # str #AnyUrl
    classifierValue: Optional[str] = None
    classifierName: str
    classifierURL: Optional[str] = None          # str #AnyUrl


class Standard(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#standard
    id: str                  # str #AnyUrl
    name: str
    issuingBody: Party
    issueDate: str           #iso8601 datetime string


class Regulation(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#regulation
    id: str                  # str #AnyUrl
    name: str
    issuingBody: Party
    effectiveDate: str       #iso8601 datetime string


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


class Facility(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#product
    identifiers: Optional[List[Identifier]] = None
    name: str
    classifications: Optional[List[Classification]] = None
    geolocation: str         # str #AnyUrl for https://plus.codes/4RQGGVGP+ can be converted https://www.dcode.fr/open-location-code
    verifiedByCAB: bool


class Product(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#product
    identifiers: Optional[List[Identifier]] = None
    marking: Optional[str] = None
    name: str
    classifications: Optional[Classification] = None
    testedBatchId: Optional[str] = None          # str #AnyUrl
    verifiedByCAB: bool


class ConformityAssessment(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#conformityassessment
    referenceStandard: Optional[Standard] = None     #defines the specification
    referenceRegulation: Optional[Regulation] = None #defines the regulation
    assessmentCriterion: Optional[Criterion] = None  #defines the criteria
    subjectProducts: Optional[List[Product]] = None
    subjectFacilities: List[Facility]
    measuredResults: Optional[List[Metric]] = None
    complaince: Optional[bool] = False
    sustainabilityTopic: SustainabilityTopic


class ConformityAssessmentScheme(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#conformityattestation
    id: str                                      # str #AnyUrl
    name: str
    trustmark: Optional[BinaryFile] = None
    issuingBody: Optional[Party] = None
    dateOfIssue: Optional[str] = None            #ISO8601 datetime string


class ConformityEvidence(BaseModel):
    evidenceRootHash: str                        #md5 hash
    description: str
    evidenceFiles: List[BinaryFile]
    decryptionKeyRequest: str                    # str #AnyUrl


class ConformityAttestation(BaseModel):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#conformityattestation
    id: str                                      #AnyUrl
    assessorLevel: Optional[AssessorAssuranceCode] = None
    assessmentLevel: AssessmentAssuranceCode
    type: AttestationType
    description: str
    scope: ConformityAssessmentScheme
    issuedBy: Party
    issuedTo: Party
    validFrom: str                               #iso8601 datetime string
    validTo: Optional[str] = None                #iso8601 datetime string
    status: Optional[Status] = None
    assessments: List[
        ConformityAssessment]                    #list of assessments that are part of this attestation, that this is a real mine.
    evidence: Optional[
        List[ConformityEvidence]] = None         #multi-media proof of claim (pictures, videos, etc)
    accreditation: Optional[Authority] = None    #proof that CPO is the right authority (from BC Gov)
    regulatoryApproval: Optional[
        Authority] = None                        #regulation that allows CPO to issue this credential
    certificate: Optional[BinaryFile] = None     #a human readable document, e.g. PDF

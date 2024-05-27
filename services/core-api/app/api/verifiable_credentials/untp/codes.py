from enum import Enum
from pydantic import BaseModel, AnyUrl
from mimetypes import MimeTypes as MimeType


class AssessorAssuranceCode(str, Enum):
    #https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#assessorassurancecode
    Self = "Self"
    Commercial = "Commercial"
    Buyer = "Buyer"
    Membership = "Membership"
    Unspecified = "Unspecified"
    ThirdParty = "ThirdParty"


class AssessmentAssuranceCode(str, Enum):
    #https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#assessmentassurancecode
    GovtApproval = "GovtApproval"
    GlobalMLA = "GlobalMLA"
    Accredited = "Accredited"
    Verified = "Verified"
    Validated = "Validated"
    Unspecified = "Unspecified"


class AttestationType(str, Enum):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#attestationtype
    Certification = "Certification"
    Declaration = "Declaration"
    Inspection = "Inspection"
    Testing = "Testing"
    Verification = "Verification"
    Validation = "Validation"
    Calibration = "Calibration"


class EncryptionMethod(str, Enum):
    NONE = "None"
    AES = "AES"


class EvidenceFormat(str, Enum):
    # https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#evidenceformat
    W3C_VC = "W3C_VC"
    ISO_MDL = "ISO_MDL"
    Document = "Document"
    Website = "Website"
    Other = "Other"


class SustainabilityTopic(str, Enum):
    #https://uncefact.github.io/spec-untp/docs/specification/ConformityCredential/#sustainabilitytopic
    Environment_Energy = "Environment.Energy"
    Environment_Emissions = "Environment.Emissions"
    Environment_Water = "Environment.Water"
    Environment_Waste = "Environment.Waste"
    Environment_Deforestation = "Environment.Deforestation"
    Environment_Biodiversity = "Environment.Biodiversity"
    Cirularity_Content = "Circularity.Content"
    Cicularity_Design = "Circularity.Design"
    Social_Labour = "Social.Labour"
    Social_Rights = "Social.Rights"
    Social_Safety = "Social.Safety"
    Governance_Ethics = "Governance.Ethics"
    Governance_Compliance = "Governance.Compliance"
    Governance_Transparency = "Governance.Transparency"

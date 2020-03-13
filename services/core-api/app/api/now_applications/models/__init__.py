from .activity_detail import *
from .activity_summary import *
from .notice_of_work_view import NoticeOfWorkView
from .now_application import NOWApplication
from .now_application_identity import NOWApplicationIdentity
from .now_application_type import NOWApplicationType
from .now_application_status import NOWApplicationStatus
from .now_application_permit_type import NOWApplicationPermitType
from .now_application_document_type import NOWApplicationDocumentType
from .now_application_review import NOWApplicationReview, NOWApplicationReviewDocumentXref
from .now_application_review_type import NOWApplicationReviewType

from .blasting_operation import BlastingOperation
from .unit_type import UnitType
from .state_of_land import StateOfLand
from .equipment import Equipment
from .etl_equipment import ETLEquipment
from .activity_equipment_xref import ActivityEquipmentXref
from .now_party_appointment import NOWPartyAppointment
from .now_application_progress import NOWApplicationProgress

model_list = [
    NoticeOfWorkView,
    NOWApplication,
    NOWApplicationIdentity,
    NOWApplicationType,
    NOWApplicationStatus,
    NOWApplicationPermitType,
    NOWApplicationDocumentType,
    NOWApplicationReview,
    NOWApplicationReviewDocumentXref,
    NOWApplicationReviewType,
    BlastingOperation,
    UnitType,
    StateOfLand,
    Equipment,
    ETLEquipment,
    ActivityEquipmentXref,
    NOWPartyAppointment,
    NOWApplicationProgress,
]
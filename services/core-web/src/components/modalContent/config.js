import MineRecordModal from "./MineRecordModal";
import AddTailingsModal from "./AddTailingsModal";
import AddPartyRelationshipModal from "./AddPartyRelationshipModal";
import EditPartyRelationshipModal from "./EditPartyRelationshipModal";
import AddPartyModal from "./AddPartyModal";
import AddPermitModal from "./AddPermitModal";
import PermitAmendmentModal from "./PermitAmendmentModal";
import EditPermitModal from "./EditPermitModal";
import EditPartyModal from "./EditPartyModal";
import AddVarianceModal from "./AddVarianceModal";
import ViewVarianceModal from "./ViewVarianceModal";
import EditVarianceModal from "./EditVarianceModal";
import AddIncidentModal from "./AddIncidentModal";
import AddReportModal from "./AddReportModal";
import AddMineWorkInformationModal from "./AddMineWorkInformationModal";
import EditNoticeOfWorkDocumentModal from "./EditNoticeOfWorkDocumentModal";
import ChangeNOWMineModal from "./ChangeNOWMineModal";
import UpdateNOWStatusModal from "./UpdateNOWStatusModal";
import DownloadDocumentPackageModal from "./DownloadDocumentPackageModal";
import EditFinalPermitDocumentPackage from "./EditFinalPermitDocumentPackage";
import NOWReviewModal from "./NOWReviewModal";
import ChangeNOWLocationModal from "./ChangeNOWLocationModal";
import GenerateDocumentModal from "./GenerateDocumentModal";
import AddBondModal from "./AddBondModal";
import ViewBondModal from "./ViewBondModal";
import AddReclamationInvoiceModal from "./AddReclamationInvoiceModal";
import TransferBondModal from "./TransferBondModal";
import CloseBondModal from "./CloseBondModal";
import DeleteConditionModal from "./DeleteConditionModal";
import DeleteDraftPermitModal from "./DeleteDraftPermitModal";
import ViewConditionModal from "./ViewConditionModal";
import AddQuickPartyModal from "./AddQuickPartyModal";
import UpdateStatusGenerateLetterModal from "./UpdateStatusGenerateLetterModal";
import NOWProgressModal from "./NOWProgressModal";
import NOWStatusReasonModal from "./NOWStatusReasonModal";
import NOWDelayModal from "./NOWDelayModal";
import GeneratePermitNumberModal from "./GeneratePermitNumberModal";
import StartDraftPermitModal from "./StartDraftPermitModal";
import AddAdministrativeAmendmentModal from "./AddAdministrativeAmendmentModal";
import EditSitePropertiesModal from "./EditSitePropertiesModal";
import UploadPermitDocumentModal from "./UploadPermitDocumentModal";
import NoPermitRequiredSelectionModal from "./NoPermitRequiredSelectionModal";
import AddExplosivesPermitModal from "./AddExplosivesPermitModal";
import AddESUPPermitModal from "./AddESUPPermitModal"
import ExplosivesPermitApplicationDecisionModal from "./ExplosivesPermitApplicationDecisionModal";
import ViewMagazineModal from "./ViewMagazineModal";
import ExplosivesPermitStatusModal from "./ExplosivesPermitStatusModal";
import ExplosivesPermitCloseModal from "./ExplosivesPermitCloseModal";
import MergePartyConfirmationModal from "./MergePartyConfirmationModal";
import ViewAllConditionsModal from "./ViewAllConditionsModal";
import UpdateNoWDateModal from "./UpdateNoWDateModal";
import EMLIContactModal from "./EMLIContactModal";
import UpdateMinespaceUserModal from "./UpdateMinespaceUserModal";
import ManageDocumentsDownloadPackageModal from "./ManageDocumentsDownloadPackageModal";
import NoticeOfDepartureModal from "./NoticeOfDepartureModal";
import UploadProjectDecisionPackageDocumentModal from "./UploadProjectDecisionPackageDocumentModal";
import UpdateProjectDecisionPackageDocumentModal from "./UpdateProjectDecisionPackageDocumentModal";
import AddMineAlertModal from "./AddMineAlertModal";
import ViewPastMineAlertModal from "./ViewPastMineAlertModal";
import ArchiveDocumentModal from "@common/components/documents/ArchiveDocumentModal";
import DeleteDocumentModal from "@common/components/documents/DeleteDocumentModal";
import ReplaceDocumentModal from "@common/components/documents/ReplaceDocumentModal";

export const modalConfig = {
  MINE_RECORD: MineRecordModal,
  ADD_TAILINGS: AddTailingsModal,
  ADD_PARTY_RELATIONSHIP: AddPartyRelationshipModal,
  ADD_QUICK_PARTY: AddQuickPartyModal,
  MERGE_PARTY_CONFIRMATION: MergePartyConfirmationModal,
  ARCHIVE_DOCUMENT: ArchiveDocumentModal,
  DELETE_DOCUMENT: DeleteDocumentModal,
  REPLACE_DOCUMENT: ReplaceDocumentModal,
  EDIT_PARTY_RELATIONSHIP: EditPartyRelationshipModal,
  ADD_CONTACT: AddPartyModal,
  ADD_PERMIT: AddPermitModal,
  PERMIT_AMENDMENT: PermitAmendmentModal,
  EDIT_PERMIT: EditPermitModal,
  EDIT_PARTY: EditPartyModal,
  ADD_VARIANCE: AddVarianceModal,
  VIEW_VARIANCE: ViewVarianceModal,
  EDIT_VARIANCE: EditVarianceModal,
  MINE_INCIDENT: AddIncidentModal,
  ADD_REPORT: AddReportModal,
  ADD_MINE_WORK_INFORMATION: AddMineWorkInformationModal,
  GENERATE_DOCUMENT: GenerateDocumentModal,
  EDIT_NOTICE_OF_WORK_DOCUMENT: EditNoticeOfWorkDocumentModal,
  CHANGE_NOW_MINE: ChangeNOWMineModal,
  DOWNLOAD_DOC_PACKAGE: DownloadDocumentPackageModal,
  EDIT_FINAL_PERMIT_DOC_PACKAGE: EditFinalPermitDocumentPackage,
  NOW_REVIEW: NOWReviewModal,
  UPDATE_NOW_STATUS: UpdateNOWStatusModal,
  CHANGE_NOW_LOCATION: ChangeNOWLocationModal,
  ADD_BOND_MODAL: AddBondModal,
  VIEW_BOND_MODAL: ViewBondModal,
  TRANSFER_BOND_MODAL: TransferBondModal,
  CLOSE_BOND_MODAL: CloseBondModal,
  ADD_RECLAMATION_INVOICE_MODAL: AddReclamationInvoiceModal,
  DELETE_CONDITION_MODAL: DeleteConditionModal,
  NOW_STATUS_LETTER_MODAL: UpdateStatusGenerateLetterModal,
  NOW_PROGRESS_MODAL: NOWProgressModal,
  NOW_STATUS_REASON_MODAL: NOWStatusReasonModal,
  NOW_DELAY_MODAL: NOWDelayModal,
  VIEW_CONDITION_MODAL: ViewConditionModal,
  VIEW_ALL_CONDITION_MODAL: ViewAllConditionsModal,
  GENERATE_PERMIT_NUMBER_MODAL: GeneratePermitNumberModal,
  START_DRAFT_PERMIT_MODAL: StartDraftPermitModal,
  ADD_ADMIN_AMENDMENT_MODAL: AddAdministrativeAmendmentModal,
  EDIT_SITE_PROPERTIES_MODAL: EditSitePropertiesModal,
  UPLOAD_PERMIT_DOCUMENT_MODAL: UploadPermitDocumentModal,
  DELETE_DRAFT_PERMIT_MODAL: DeleteDraftPermitModal,
  NO_PERMIT_REQUIRED_SELECTION_MODAL: NoPermitRequiredSelectionModal,
  EXPLOSIVES_PERMIT_MODAL: AddExplosivesPermitModal,
  ESUP_PERMIT_MODAL: AddESUPPermitModal,
  EXPLOSIVES_PERMIT_DECISION_MODAL: ExplosivesPermitApplicationDecisionModal,
  VIEW_MAGAZINE_MODAL: ViewMagazineModal,
  EXPLOSIVES_PERMIT_STATUS_MODAL: ExplosivesPermitStatusModal,
  EXPLOSIVES_PERMIT_CLOSE_MODAL: ExplosivesPermitCloseModal,
  UPDATE_NOW_DATE_MODAL: UpdateNoWDateModal,
  EMLI_CONTACT_MODAL: EMLIContactModal,
  UPDATE_MINESPACE_USERS: UpdateMinespaceUserModal,
  NOW_MANAGE_DOCUMENTS_DOWNLOAD_PACKAGE_MODAL: ManageDocumentsDownloadPackageModal,
  NOTICE_OF_DEPARTURE_MODAL: NoticeOfDepartureModal,
  UPLOAD_PROJECT_DECISION_PACKAGE_DOCUMENT_MODAL: UploadProjectDecisionPackageDocumentModal,
  UPDATE_PROJECT_DECISION_PACKAGE_DOCUMENT_MODAL: UpdateProjectDecisionPackageDocumentModal,
  ADD_MINE_ALERT: AddMineAlertModal,
  VIEW_PAST_MINE_ALERTS: ViewPastMineAlertModal,
};

export default modalConfig;

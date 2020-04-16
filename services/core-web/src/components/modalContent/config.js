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
import ViewIncidentModal from "./ViewIncidentModal";
import EditNoticeOfWorkDocumentModal from "./EditNoticeOfWorkDocumentModal";
import ChangeNOWMineModal from "./ChangeNOWMineModal";
import UpdateNOWLeadInspectorModal from "./UpdateNOWLeadInspectorModal";
import UpdateNOWStatusModal from "./UpdateNOWStatusModal";
import DownloadDocumentPackageModal from "./DownloadDocumentPackageModal";
import EditFinalPermitDocumentPackage from "./EditFinalPermitDocumentPackage";
import NOWReviewModal from "./NOWReviewModal";
import ChangeNOWLocationModal from "./ChangeNOWLocationModal";
import GenerateDocumentModal from "./GenerateDocumentModal";
import AddBondModal from "./AddBondModal";
import ViewBondModal from "./ViewBondModal";
import AddReclamationInvoiceModal from "./AddReclamationInvoiceModal";

export const modalConfig = {
  MINE_RECORD: MineRecordModal,
  ADD_TAILINGS: AddTailingsModal,
  ADD_PARTY_RELATIONSHIP: AddPartyRelationshipModal,
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
  GENERATE_DOCUMENT: GenerateDocumentModal,
  VIEW_MINE_INCIDENT: ViewIncidentModal,
  EDIT_NOTICE_OF_WORK_DOCUMENT: EditNoticeOfWorkDocumentModal,
  CHANGE_NOW_MINE: ChangeNOWMineModal,
  DOWNLOAD_DOC_PACKAGE: DownloadDocumentPackageModal,
  EDIT_FINAL_PERMIT_DOC_PACKAGE: EditFinalPermitDocumentPackage,
  NOW_REVIEW: NOWReviewModal,
  UPDATE_NOW_LEAD_INSPECTOR: UpdateNOWLeadInspectorModal,
  UPDATE_NOW_STATUS: UpdateNOWStatusModal,
  CHANGE_NOW_LOCATION: ChangeNOWLocationModal,
  ADD_BOND_MODAL: AddBondModal,
  VIEW_BOND_MODAL: ViewBondModal,
  ADD_RECLAMATION_INVOICE_MODAL: AddReclamationInvoiceModal,
};

export default modalConfig;

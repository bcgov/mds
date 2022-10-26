import AddReportModal from "@/components/modalContent/reports/AddReportModal";
import EditReportModal from "@/components/modalContent/reports/EditReportModal";
import AddVarianceModal from "@/components/modalContent/variances/AddVarianceModal";
import ViewVarianceModal from "@/components/modalContent/variances/ViewVarianceModal";
import EditVarianceModal from "@/components/modalContent/variances/EditVarianceModal";
import ViewIncidentModal from "@/components/modalContent/incidents/ViewIncidentModal";
import AddTailingsModal from "@/components/modalContent/tailing/AddTailingsModal";
import AddIncidentModal from "@/components/modalContent/incidents/AddIncidentModal";
import AddContactModal from "@/components/modalContent/contacts/AddContactModal";
import AddNoticeOfDepartureModal from "@/components/modalContent/noticeOfDeparture/AddNoticeOfDepartureModal";
import ViewNoticeOfDepartureModal from "@/components/modalContent/noticeOfDeparture/ViewNoticeOfDepartureModal";
import EditNoticeOfDepartureModal from "@/components/modalContent/noticeOfDeparture/EditNoticeOfDepartureModal";
import ImportIRTSuccessModal from "@/components/modalContent/informationRequirementsTable/ImportIRTSuccessModal";
import ImportIRTErrorModal from "@/components/modalContent/informationRequirementsTable/ImportIRTErrorModal";
import ViewFileHistoryModal from "./informationRequirementsTable/ViewFileHistoryModal";
import UploadIncidentDocumentModal from "@/components/modalContent/incidents/UploadIncidentDocumentModal";

export const modalConfig = {
  ADD_REPORT: AddReportModal,
  EDIT_REPORT: EditReportModal,
  ADD_VARIANCE: AddVarianceModal,
  VIEW_VARIANCE: ViewVarianceModal,
  EDIT_VARIANCE: EditVarianceModal,
  VIEW_INCIDENT: ViewIncidentModal,
  ADD_TAILINGS: AddTailingsModal,
  ADD_INCIDENT: AddIncidentModal,
  ADD_CONTACT: AddContactModal,
  ADD_NOTICE_OF_DEPARTURE: AddNoticeOfDepartureModal,
  VIEW_NOTICE_OF_DEPARTURE: ViewNoticeOfDepartureModal,
  EDIT_NOTICE_OF_DEPARTURE: EditNoticeOfDepartureModal,
  IMPORT_IRT_SUCCESS: ImportIRTSuccessModal,
  IMPORT_IRT_FAILURE: ImportIRTErrorModal,
  VIEW_FILE_HISTORY: ViewFileHistoryModal,
  UPLOAD_INCIDENT_DOCUMENT: UploadIncidentDocumentModal,
};

export default modalConfig;

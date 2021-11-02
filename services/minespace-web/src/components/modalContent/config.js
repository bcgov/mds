import AddReportModal from "@/components/modalContent/reports/AddReportModal";
import EditReportModal from "@/components/modalContent/reports/EditReportModal";
import AddVarianceModal from "@/components/modalContent/variances/AddVarianceModal";
import ViewVarianceModal from "@/components/modalContent/variances/ViewVarianceModal";
import EditVarianceModal from "@/components/modalContent/variances/EditVarianceModal";
import ViewIncidentModal from "@/components/modalContent/incidents/ViewIncidentModal";
import AddTailingsModal from "@/components/modalContent/tailing/AddTailingsModal";
import AddIncidentModal from "@/components/modalContent/incidents/AddIncidentModal";

export const modalConfig = {
  ADD_REPORT: AddReportModal,
  EDIT_REPORT: EditReportModal,
  ADD_VARIANCE: AddVarianceModal,
  VIEW_VARIANCE: ViewVarianceModal,
  EDIT_VARIANCE: EditVarianceModal,
  VIEW_INCIDENT: ViewIncidentModal,
  ADD_TAILINGS: AddTailingsModal,
  ADD_INCIDENT: AddIncidentModal,
};

export default modalConfig;

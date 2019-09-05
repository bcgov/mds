import AddReportModal from "@/components/modalContent/reports/AddReportModal";
import AddVarianceModal from "@/components/modalContent/variances/AddVarianceModal";
import ViewVarianceModal from "@/components/modalContent/variances/ViewVarianceModal";
import EditVarianceModal from "@/components/modalContent/variances/EditVarianceModal";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const modalConfig = {
  ADD_REPORT: AddReportModal,
  ADD_VARIANCE: AddVarianceModal,
  VIEW_VARIANCE: ViewVarianceModal,
  EDIT_VARIANCE: EditVarianceModal,
};

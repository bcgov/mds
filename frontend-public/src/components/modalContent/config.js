import EditReportModal from "./EditReportModal";
import AddVarianceModal from "@/components/modalContent/variances/AddVarianceModal";
import ViewVarianceModal from "@/components/modalContent/variances/ViewVarianceModal";
import EditVarianceModal from "@/components/modalContent/variances/EditVarianceModal";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const modalConfig = {
  EDIT_REPORT: EditReportModal,
  ADD_VARIANCE: AddVarianceModal,
  VIEW_VARIANCE: ViewVarianceModal,
  EDIT_VARIANCE: EditVarianceModal,
};

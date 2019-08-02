import MineRecordModal from "./MineRecordModal";
import AddTailingsModal from "./AddTailingsModal";
import EditTailingsReportModal from "./EditTailingsReportModal";
import AddTailingsReportModal from "./AddTailingsReportModal";
import AddPartyRelationshipModal from "./AddPartyRelationshipModal";
import EditPartyRelationshipModal from "./EditPartyRelationshipModal";
import AddPartyModal from "./AddPartyModal";
import AddPermitModal from "./AddPermitModal";
import PermitAmendmentModal from "./PermitAmendmentModal";
import EditPermitModal from "./EditPermitModal";
import EditPartyModal from "./EditPartyModal";
import AddApplicationModal from "./AddApplicationModal";
import EditApplicationModal from "./EditApplicationModal";
import AddVarianceModal from "./AddVarianceModal";
import ViewVarianceModal from "./ViewVarianceModal";
import EditVarianceModal from "./EditVarianceModal";
import AddIncidentModal from "./AddIncidentModal";
import AddReportModal from "./AddReportModal";
// import EditReportModal from "./EditReportModal";
import ViewIncidentModal from "./ViewIncidentModal";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const modalConfig = {
  MINE_RECORD: MineRecordModal,
  ADD_TAILINGS: AddTailingsModal,
  EDIT_TAILINGS_REPORT: EditTailingsReportModal,
  ADD_TAILINGS_REPORT: AddTailingsReportModal,
  ADD_PARTY_RELATIONSHIP: AddPartyRelationshipModal,
  EDIT_PARTY_RELATIONSHIP: EditPartyRelationshipModal,
  ADD_CONTACT: AddPartyModal,
  ADD_PERMIT: AddPermitModal,
  PERMIT_AMENDMENT: PermitAmendmentModal,
  EDIT_PERMIT: EditPermitModal,
  EDIT_PARTY: EditPartyModal,
  ADD_APPLICATION: AddApplicationModal,
  EDIT_APPLICATION: EditApplicationModal,
  ADD_VARIANCE: AddVarianceModal,
  VIEW_VARIANCE: ViewVarianceModal,
  EDIT_VARIANCE: EditVarianceModal,
  MINE_INCIDENT: AddIncidentModal,
  ADD_REPORT: AddReportModal,
  //  EDIT_REPORT:
  VIEW_MINE_INCIDENT: ViewIncidentModal,
};

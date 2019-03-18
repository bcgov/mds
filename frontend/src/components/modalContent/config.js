import MineRecordModal from "./MineRecordModal";
import AddTenureModal from "./AddTenureModal";
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

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const modalConfig = {
  MINE_RECORD: MineRecordModal,
  ADD_TENURE: AddTenureModal,
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
};

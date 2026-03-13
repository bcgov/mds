import React, { FC } from "react";
import { getParties } from "@mds/common/redux/slices/partiesSlice";
import EditFullPartyForm, {
  EditFullPartyFormValues,
} from "@/components/Forms/parties/EditFullPartyForm";
import moment from "moment";
import { formatDate } from "@common/utils/helpers";
import { useAppSelector } from "@mds/common/redux/rootState";
import { IParty } from "@mds/common/interfaces";

interface EditPartyProps {
  onSubmit: () => any;
  partyGuid: string;
}

export const EditPartyModal: FC<EditPartyProps> = ({ onSubmit, partyGuid }) => {
  const parties = useAppSelector(getParties) as IParty[];
  const partyFromStore = parties[partyGuid];
  const party: EditFullPartyFormValues = partyFromStore ? { ...partyFromStore } : null;
  const today = moment().utc();
  const sortedBusinessRoleAppts = [...party?.business_role_appts].sort(
    (a, b) => b.party_business_role_appt_id - a.party_business_role_appt_id
  );
  const inspectorInfo = sortedBusinessRoleAppts.find(
    (role) =>
      role.party_business_role_code === "INS" &&
      today.isSameOrAfter(role.start_date, "day") &&
      (!role.end_date || today.isBefore(role.end_date, "day"))
  );

  const projectLeadInfo = sortedBusinessRoleAppts.find(
    (role) =>
      role.party_business_role_code === "PRL" &&
      today.isSameOrAfter(role.start_date, "day") &&
      (!role.end_date || today.isBefore(role.end_date, "day"))
  );

  const consultationAdvisorInfo = sortedBusinessRoleAppts.find(
    (role) =>
      role.party_business_role_code === "CNA" &&
      today.isSameOrAfter(role.start_date, "day") &&
      (!role.end_date || today.isBefore(role.end_date, "day"))
  );

  if (inspectorInfo) {
    party.set_to_inspector =
      today.isSameOrAfter(inspectorInfo.start_date, "day") &&
      (!inspectorInfo.end_date || today.isSameOrBefore(inspectorInfo.end_date, "day"));
    party.inspector_start_date = moment(formatDate(inspectorInfo.start_date)).format("YYYY-MM-DD");
    party.inspector_end_date = inspectorInfo.end_date
      ? moment(formatDate(inspectorInfo.end_date)).format("YYYY-MM-DD")
      : null;
  }

  if (projectLeadInfo) {
    party.set_to_project_lead =
      today.isSameOrAfter(projectLeadInfo.start_date, "day") &&
      (!projectLeadInfo.end_date || today.isSameOrBefore(projectLeadInfo.end_date, "day"));
    party.project_lead_start_date = moment(formatDate(projectLeadInfo.start_date)).format(
      "YYYY-MM-DD"
    );
    party.project_lead_end_date = projectLeadInfo.end_date
      ? moment(formatDate(projectLeadInfo.end_date)).format("YYYY-MM-DD")
      : null;
  }

  if (consultationAdvisorInfo) {
    party.set_to_consultation_advisor =
      today.isSameOrAfter(consultationAdvisorInfo.start_date, "day") &&
      (!consultationAdvisorInfo.end_date || today.isSameOrBefore(consultationAdvisorInfo.end_date, "day"));
    party.consultation_advisor_start_date = moment(formatDate(consultationAdvisorInfo.start_date)).format(
      "YYYY-MM-DD"
    );
    party.consultation_advisor_end_date = consultationAdvisorInfo.end_date
      ? moment(formatDate(consultationAdvisorInfo.end_date)).format("YYYY-MM-DD")
      : null;
  }

  const initialValues = {
    ...party,
    ...(party?.address?.[0] ? party.address[0] : {}),
    email: party?.email && party.email !== "Unknown" ? party.email : null,
  };

  return <EditFullPartyForm onSubmit={onSubmit} party={party} initialValues={initialValues} />;
};

export default EditPartyModal;

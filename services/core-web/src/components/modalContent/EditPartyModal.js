import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getParties } from "@mds/common/redux/selectors/partiesSelectors";
import CustomPropTypes from "@/customPropTypes";
import EditFullPartyForm from "@/components/Forms/parties/EditFullPartyForm";
import { getDropdownProvinceOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import moment from "moment";
import { formatDate } from "@common/utils/helpers";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  parties: PropTypes.arrayOf(CustomPropTypes.party).isRequired,
  partyGuid: PropTypes.string.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

export const EditPartyModal = (props) => {
  const party = props.parties[props.partyGuid];
  const today = moment().utc();
  const inspectorInfo = party.business_role_appts.find(
    (role) =>
      role.party_business_role_code === "INS" &&
      today.isSameOrAfter(role.start_date, "day") &&
      (!role.end_date || today.isBefore(role.end_date, "day"))
  );

  const projectLeadInfo = party.business_role_appts.find(
    (role) =>
      role.party_business_role_code === "PRL" &&
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

  const initialValues = {
    ...party,
    ...(party.address[0] ? party.address[0] : {}),
    email: party.email && party.email !== "Unknown" ? party.email : null,
  };

  return (
    <EditFullPartyForm
      onSubmit={props.onSubmit}
      closeModal={props.closeModal}
      party={party}
      provinceOptions={props.provinceOptions}
      initialValues={initialValues}
    />
  );
};

const mapStateToProps = (state) => ({
  parties: getParties(state),
  provinceOptions: getDropdownProvinceOptions(state),
});

EditPartyModal.propTypes = propTypes;

export default connect(mapStateToProps)(EditPartyModal);

import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getParties } from "@common/selectors/partiesSelectors";
import CustomPropTypes from "@/customPropTypes";
import EditFullPartyForm from "@/components/Forms/parties/EditFullPartyForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  parties: PropTypes.arrayOf(CustomPropTypes.party).isRequired,
  partyGuid: PropTypes.string.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

export const EditPartyModal = (props) => {
  const party = props.parties[props.partyGuid];
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
});

EditPartyModal.propTypes = propTypes;

export default connect(mapStateToProps)(EditPartyModal);

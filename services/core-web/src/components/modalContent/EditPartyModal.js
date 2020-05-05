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
  party: CustomPropTypes.party.isRequired,
  isPerson: PropTypes.bool.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const EditPartyModal = (props) => (
  <EditFullPartyForm
    onSubmit={props.onSubmit}
    closeModal={props.closeModal}
    party={props.parties[props.party.party_guid]}
    isPerson={props.isPerson}
    provinceOptions={props.provinceOptions}
    initialValues={props.initialValues}
  />
);

const mapStateToProps = (state) => ({
  parties: getParties(state),
});

EditPartyModal.propTypes = propTypes;

export default connect(mapStateToProps)(EditPartyModal);

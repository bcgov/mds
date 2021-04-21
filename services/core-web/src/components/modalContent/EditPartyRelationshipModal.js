import React from "react";
import PropTypes from "prop-types";
import EditPartyRelationshipForm from "@/components/Forms/PartyRelationships/EditPartyRelationshipForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
  partyRelationshipType: CustomPropTypes.partyRelationshipType.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  minePermits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

const defaultProps = {
  partyRelationships: [],
};

const EditPartyRelationshipModal = (props) => (
  <EditPartyRelationshipForm {...props} initialValues={props.partyRelationship} />
);

EditPartyRelationshipModal.propTypes = propTypes;
EditPartyRelationshipModal.defaultProps = defaultProps;

export default EditPartyRelationshipModal;

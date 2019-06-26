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
};

const defaultProps = {
  partyRelationships: [],
};

const EditPartyRelationshipModal = (props) => {
  const initialValues = props.partyRelationship;

  return (
    <div>
      <EditPartyRelationshipForm {...props} initialValues={initialValues} />
    </div>
  );
};

EditPartyRelationshipModal.propTypes = propTypes;
EditPartyRelationshipModal.defaultProps = defaultProps;

export default EditPartyRelationshipModal;

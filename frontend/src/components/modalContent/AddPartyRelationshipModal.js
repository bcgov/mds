import React from "react";
import PropTypes from "prop-types";
import AddPartyRelationshipForm from "@/components/Forms/PartyRelationships/AddPartyRelationshipForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  partyRelationshipType: CustomPropTypes.partyRelationshipType.isRequired,
  mine: CustomPropTypes.mine.isRequired,
};

export const AddPartyRelationshipModal = (props) => (
  <div>
    <AddPartyRelationshipForm
      onSubmit={props.onSubmit}
      handleChange={props.handleChange}
      closeModal={props.closeModal}
      title={props.title}
      partyRelationshipType={props.partyRelationshipType}
      mine={props.mine}
    />
  </div>
);

AddPartyRelationshipModal.propTypes = propTypes;

export default AddPartyRelationshipModal;

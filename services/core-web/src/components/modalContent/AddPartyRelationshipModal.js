import React from "react";
import PropTypes from "prop-types";
import AddPartyRelationshipForm from "@/components/Forms/PartyRelationships/AddPartyRelationshipForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  partyRelationshipType: CustomPropTypes.partyRelationshipType.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  minePermits: CustomPropTypes.permits,
  createPartyOnly: PropTypes.bool,
};

const defaultProps = {
  partyRelationships: [],
  minePermits: [],
  createPartyOnly: false,
};

export const AddPartyRelationshipModal = (props) => (
  <div>
    <AddPartyRelationshipForm
      onSubmit={props.onSubmit}
      handleChange={props.handleChange}
      closeModal={props.closeModal}
      title={props.title}
      partyRelationships={props.partyRelationships}
      partyRelationshipType={props.partyRelationshipType}
      mine={props.mine}
      minePermits={props.minePermits}
      onFileLoad={props.onFileLoad}
      onRemoveFile={props.onRemoveFile}
      createPartyOnly={props.createPartyOnly}
    />
  </div>
);

AddPartyRelationshipModal.propTypes = propTypes;
AddPartyRelationshipModal.defaultProps = defaultProps;

export default AddPartyRelationshipModal;

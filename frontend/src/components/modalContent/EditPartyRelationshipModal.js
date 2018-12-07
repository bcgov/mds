import React, { Component } from "react";
import PropTypes from "prop-types";
import EditPartyRelationshipForm from "@/components/Forms/PartyRelationships/EditPartyRelationshipForm";
import * as ModalContent from "@/constants/modalContent";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  partyRelationship: PropTypes.object.isRequired,
  mine: PropTypes.object.isRequired,
};

export class EditPartyRelationshipModal extends Component {
  render() {
    return (
      <div>
        <EditPartyRelationshipForm {...this.props} />
      </div>
    );
  }
}

EditPartyRelationshipModal.propTypes = propTypes;

export default EditPartyRelationshipModal;

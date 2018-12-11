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
    const initialValues = this.props.partyRelationship;
    initialValues.start_date =
      initialValues.start_date === "None" ? null : initialValues.start_date;
    initialValues.end_date = initialValues.end_date === "None" ? null : initialValues.end_date;

    return (
      <div>
        <EditPartyRelationshipForm {...this.props} initialValues={initialValues} />
      </div>
    );
  }
}

EditPartyRelationshipModal.propTypes = propTypes;

export default EditPartyRelationshipModal;

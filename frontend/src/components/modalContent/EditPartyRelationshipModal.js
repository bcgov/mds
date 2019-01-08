import React, { Component } from "react";
import PropTypes from "prop-types";
import EditPartyRelationshipForm from "@/components/Forms/PartyRelationships/EditPartyRelationshipForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
  mine: CustomPropTypes.mine.isRequired,
};

const EditPartyRelationshipModal = (props) => {
  const initialValues = props.partyRelationship;
  initialValues.start_date = initialValues.start_date;
  initialValues.end_date = initialValues.end_date;

  return (
    <div>
      <EditPartyRelationshipForm {...props} initialValues={initialValues} />
    </div>
  );
};

EditPartyRelationshipModal.propTypes = propTypes;

export default EditPartyRelationshipModal;

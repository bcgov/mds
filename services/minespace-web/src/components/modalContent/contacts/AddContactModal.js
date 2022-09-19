import React from "react";
import PropTypes from "prop-types";
import AddContactForm from "@/components/Forms/contacts/AddContactForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

const AddContactModal = (props) => {
  const { onSubmit } = props;

  return <AddContactForm onSubmit={onSubmit} />;
};

AddContactModal.propTypes = propTypes;

export default AddContactModal;

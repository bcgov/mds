import React from "react";
import PropTypes from "prop-types";
import AddContactForm from "@/components/Forms/contacts/AddContactForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

const AddContactModal = (props) => {
  const { onSubmit, onCancel } = props;

  return <AddContactForm onSubmit={onSubmit} onCancel={onCancel} />;
};

AddContactModal.propTypes = propTypes;

export default AddContactModal;

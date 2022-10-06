import React from "react";
import PropTypes from "prop-types";
import AddContactForm from "@/components/Forms/contacts/AddContactForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  mine_party_appt_type_code: PropTypes.string.isRequired,
};

export const AddContactModal = (props) => {
  const { onSubmit, onCancel } = props;

  return (
    <AddContactForm
      onSubmit={onSubmit}
      onCancel={onCancel}
      mine_party_appt_type_code={props.mine_party_appt_type_code}
    />
  );
};

AddContactModal.propTypes = propTypes;

export default AddContactModal;

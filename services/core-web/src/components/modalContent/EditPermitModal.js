import React from "react";
import PropTypes from "prop-types";
import EditPermitForm from "@/components/Forms/EditPermitForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export const EditPermitModal = (props) => <EditPermitForm {...props} />;

EditPermitModal.propTypes = propTypes;

export default EditPermitModal;

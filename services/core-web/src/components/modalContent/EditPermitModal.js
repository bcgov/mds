import React from "react";
import PropTypes from "prop-types";
import EditPermitForm from "@/components/Forms/EditPermitForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const EditPermitModal = (props) => (
  <div>
    <EditPermitForm {...props} />
  </div>
);

EditPermitModal.propTypes = propTypes;
EditPermitModal.defaultProps = defaultProps;

export default EditPermitModal;

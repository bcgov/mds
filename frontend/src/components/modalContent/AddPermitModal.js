import React from "react";
import PropTypes from "prop-types";
import AddPermitForm from "@/components/Forms/AddPermitForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const AddPermitModal = (props) => (
  <div>
    <AddPermitForm {...props} />
  </div>
);

AddPermitModal.propTypes = propTypes;
AddPermitModal.defaultProps = defaultProps;
export default AddPermitModal;

import React from "react";
import PropTypes from "prop-types";
import AddApplicationForm from "@/components/Forms/applications/AddApplicationForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const AddApplicationModal = (props) => (
  <div>
    <AddApplicationForm {...props} />
  </div>
);

AddApplicationModal.propTypes = propTypes;
AddApplicationModal.defaultProps = defaultProps;

export default AddApplicationModal;

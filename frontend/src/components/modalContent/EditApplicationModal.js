import React from "react";
import PropTypes from "prop-types";
import EditApplicationForm from "@/components/Forms/applications/EditApplicationForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const EditApplicationModal = (props) => (
  <div>
    <EditApplicationForm {...props} />
  </div>
);

EditApplicationModal.propTypes = propTypes;
EditApplicationModal.defaultProps = defaultProps;

export default EditApplicationModal;

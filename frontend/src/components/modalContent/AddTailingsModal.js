import React from "react";
import PropTypes from "prop-types";
import AddTailingsForm from "@/components/Forms/AddTailingsForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const AddTailingsModal = (props) => (
  <div>
    <AddTailingsForm {...props} />
  </div>
);

AddTailingsModal.propTypes = propTypes;
AddTailingsModal.defaultProps = defaultProps;
export default AddTailingsModal;

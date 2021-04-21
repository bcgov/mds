import React from "react";
import PropTypes from "prop-types";
import AddTailingsForm from "@/components/Forms/AddTailingsForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export const AddTailingsModal = (props) => <AddTailingsForm {...props} />;

AddTailingsModal.propTypes = propTypes;
export default AddTailingsModal;

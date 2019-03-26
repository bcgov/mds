import React from "react";
import PropTypes from "prop-types";
import AddVarianceForm from "@/components/Forms/variances/AddVarianceForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export const AddVarianceModal = (props) => (
  <div>
    <AddVarianceForm onSubmit={props.onSubmit} closeModal={props.closeModal} />
  </div>
);

AddVarianceModal.propTypes = propTypes;

export default AddVarianceModal;

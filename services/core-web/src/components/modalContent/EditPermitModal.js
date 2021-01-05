import React from "react";
import PropTypes from "prop-types";
import EditPermitForm from "@/components/Forms/EditPermitForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const EditPermitModal = (props) => (
  <EditPermitForm
    {...props}
    initialValues={{
      ...props.initialValues,
      remaining_liability: props.initialValues.remaining_liability || 0,
    }}
  />
);

EditPermitModal.propTypes = propTypes;

export default EditPermitModal;

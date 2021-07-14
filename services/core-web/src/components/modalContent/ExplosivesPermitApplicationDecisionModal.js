import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import ExplosivesPermitDecisionForm from "@/components/Forms/ExplosivesPermit/ExplosivesPermitDecisionForm";

const propTypes = {
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
  documentType: PropTypes.string.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  onSubmit: PropTypes.func.isRequired,
  previewDocument: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export const ExplosivesPermitApplicationDecisionModal = (props) => (
  <ExplosivesPermitDecisionForm
    initialValues={props.initialValues}
    documentType={props.documentType}
    inspectors={props.inspectors}
    onSubmit={props.onSubmit}
    previewDocument={props.previewDocument}
    closeModal={props.closeModal}
  />
);

ExplosivesPermitApplicationDecisionModal.propTypes = propTypes;

export default ExplosivesPermitApplicationDecisionModal;

import React from "react";
import ExplosivesPermitStatusForm from "@/components/Forms/ExplosivesPermit/ExplosivesPermitStatusForm";

const propTypes = {};

const defaultProps = {};

export const ExplosivesPermitStatusModal = (props) => (
  <div>
    <ExplosivesPermitStatusForm {...props} />
  </div>
);

ExplosivesPermitStatusModal.propTypes = propTypes;
ExplosivesPermitStatusModal.defaultProps = defaultProps;

export default ExplosivesPermitStatusModal;

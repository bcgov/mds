import React from "react";
import ExplosivesPermitCloseForm from "@/components/Forms/ExplosivesPermit/ExplosivesPermitCloseForm";

const propTypes = {};

const defaultProps = {};

export const ExplosivesPermitCloseModal = (props) => (
  <div>
    <ExplosivesPermitCloseForm {...props} />
  </div>
);

ExplosivesPermitCloseModal.propTypes = propTypes;
ExplosivesPermitCloseModal.defaultProps = defaultProps;

export default ExplosivesPermitCloseModal;

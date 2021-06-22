/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import ExplosivesPermitForm from "@/components/Forms/ExplosivesPermit/ExplosivesPermitForm";

const propTypes = {};

const defaultProps = {};

export const AddExplosivesPermitModal = (props) => (
  <div>
    <ExplosivesPermitForm {...props} />
  </div>
);

AddExplosivesPermitModal.propTypes = propTypes;
AddExplosivesPermitModal.defaultProps = defaultProps;

export default AddExplosivesPermitModal;

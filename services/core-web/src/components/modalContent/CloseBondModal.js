import React from "react";
import PropTypes from "prop-types";
import { Alert } from "antd";
import CloseBondForm from "@/components/Forms/Securities/CloseBondForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  bond: CustomPropTypes.bond.isRequired,
  bondStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  bondStatusCode: PropTypes.string.isRequired,
};

export const CloseBondModal = (props) => {
  const handleCloseBond = (values) => props.onSubmit(props.bondStatusCode, values, props.bond);
  const alertMessage =
    (props.bondStatusCode === "REL" && "Release Bond") ||
    (props.bondStatusCode === "CON" && "Confiscate Bond");
  const alertDescription =
    (props.bondStatusCode === "REL" && "Are you sure you want to release this bond?") ||
    (props.bondStatusCode === "CON" &&
      "Are you sure you want to confiscate this bond? Doing so will convert the bond type to cash.");
  return (
    <div>
      <Alert
        message={alertMessage}
        description={alertDescription}
        type="info"
        showIcon
        style={{ textAlign: "left" }}
      />
      <br />
      <CloseBondForm
        onSubmit={handleCloseBond}
        closeModal={props.closeModal}
        title={props.title}
        bond={props.bond}
        bondStatusCode={props.bondStatusCode}
        bondStatusOptionsHash={props.bondStatusOptionsHash}
      />
    </div>
  );
};

CloseBondModal.propTypes = propTypes;

export default CloseBondModal;

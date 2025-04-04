import React from "react";
import PropTypes from "prop-types";
import { Alert } from "antd";
import GeneratePermitNumberForm from "@/components/Forms/permits/GeneratePermitNumberForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  signature: PropTypes.string.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "Generate Permit Number",
};

export const GeneratePermitNumberModal = (props) => {
  return (
    <div>
      {!props.signature && (
        <>
          <Alert
            message="Signature needed to generate."
            description="The signature for the Issuing Inspector has not been provided."
            type="error"
            showIcon
          />
          <br />
        </>
      )}
      <GeneratePermitNumberForm
        onSubmit={props.onSubmit}
        disabled={!props.signature}
      />
    </div>
  );
};

GeneratePermitNumberModal.propTypes = propTypes;
GeneratePermitNumberModal.defaultProps = defaultProps;

export default GeneratePermitNumberModal;

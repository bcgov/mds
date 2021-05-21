import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Alert, Select, Popconfirm, Button } from "antd";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  signature: PropTypes.string.isRequired,
};

const defaultProps = {};

export const NoPermitRequiredSelectionModal = (props) => {
  const [letterCode, setLetterCode] = useState(null);
  const [disabled, setDisabled] = useState(true);

  const options = [
    { value: "NPR", label: "No Permit Required" },
    { value: "NPI", label: "No Permit Required IP" },
  ];

  useEffect(() => {
    if (letterCode) {
      setDisabled(false);
    }
  }, [letterCode]);

  const handleNextStep = () => props.nextStep(letterCode);

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
      <Select
        virtual={false}
        labelInValue
        placeholder="Select a No Permit Required Letter"
        onChange={(value, option) => {
          setLetterCode(option.value);
        }}
        options={options}
        style={{ width: "100%" }}
      />
      <div className="right center-mobile">
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          onConfirm={props.closeModal}
          okText="Yes"
          cancelText="No"
        >
          <Button className="full-mobile" type="secondary">
            Cancel
          </Button>
        </Popconfirm>
        <Button className="full-mobile" type="primary" onClick={handleNextStep} disabled={disabled}>
          Generate Letter
        </Button>
      </div>
    </div>
  );
};

NoPermitRequiredSelectionModal.propTypes = propTypes;
NoPermitRequiredSelectionModal.defaultProps = defaultProps;

export default NoPermitRequiredSelectionModal;

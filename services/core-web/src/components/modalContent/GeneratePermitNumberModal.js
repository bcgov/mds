import React from "react";
import PropTypes from "prop-types";
import { Alert } from "antd";
import { connect } from "react-redux";
import { getFormSyncErrors, hasSubmitFailed } from "redux-form";
import * as FORM from "@/constants/forms";
import GeneratePermitNumberForm from "@/components/Forms/permits/GeneratePermitNumberForm";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  documentType: PropTypes.objectOf(PropTypes.any).isRequired,
  onSubmit: PropTypes.func.isRequired,
  formSyncErrors: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  signature: PropTypes.string.isRequired,
  submitFailed: PropTypes.bool.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "Generate Document",
};

export const GeneratePermitNumberModal = (props) => {
  const errorsLength = Object.keys(props.formSyncErrors).length;
  const showErrors = props.submitFailed && errorsLength > 0;
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
        {...props}
        showActions={false}
        onSubmit={props.onSubmit}
        disabled={!props.signature}
      />
      {showErrors && (
        <div className="error center">
          <Alert
            message={`You have ${errorsLength} ${
              errorsLength === 1 ? "issue" : "issues"
            } that must be fixed before proceeding.`}
            type="error"
            showIcon
          />
        </div>
      )}
    </div>
  );
};

GeneratePermitNumberModal.propTypes = propTypes;
GeneratePermitNumberModal.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  formSyncErrors: getFormSyncErrors(FORM.GENERATE_PERMIT_NUMBER)(state),
  submitFailed: hasSubmitFailed(FORM.GENERATE_PERMIT_NUMBER)(state),
});

export default connect(mapStateToProps)(GeneratePermitNumberModal);

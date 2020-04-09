import React from "react";
import PropTypes from "prop-types";
import { Alert } from "antd";
import { connect } from "react-redux";
import { getFormSyncErrors } from "redux-form";
import GenerateDocumentForm from "@/components/Forms/GenerateDocumentForm";
import * as FORM from "@/constants/forms";

const propTypes = {
  documentType: PropTypes.objectOf(PropTypes.any).isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  documentFormErrors: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
};

const defaultProps = {
  title: "Generate Document",
};

export const GenerateDocumentModal = (props) => {
  const errorsLength = Object.keys(props.documentFormErrors).length;
  const showErrors = errorsLength > 0;
  return (
    <div>
      <GenerateDocumentForm {...props} />
      {showErrors && (
        <div className="error center">
          <Alert
            message={`You have ${errorsLength} ${
              errorsLength === 1 ? "issue" : "issues"
            } that must be fixed before proceeding`}
            type="error"
            showIcon
          />
        </div>
      )}
    </div>
  );
};

GenerateDocumentModal.propTypes = propTypes;
GenerateDocumentModal.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  documentFormErrors: getFormSyncErrors(FORM.GENERATE_DOCUMENT)(state),
});

export default connect(mapStateToProps)(GenerateDocumentModal);

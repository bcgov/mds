import React, { Component } from "react";
import PropTypes from "prop-types";
import { Alert } from "antd";
import { connect } from "react-redux";
import { getFormSyncErrors, hasSubmitFailed } from "redux-form";
import GenerateDocumentForm from "@/components/Forms/GenerateDocumentForm";
import * as FORM from "@/constants/forms";

const propTypes = {
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  documentType: PropTypes.objectOf(PropTypes.any).isRequired,
  onSubmit: PropTypes.func.isRequired,
  preview: PropTypes.func.isRequired,
  formSyncErrors: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  signature: PropTypes.string.isRequired,
  submitFailed: PropTypes.bool.isRequired,
  title: PropTypes.string,
  allowDocx: PropTypes.bool,
};

const defaultProps = {
  title: "Generate Document",
  allowDocx: false,
};

export class GenerateDocumentModal extends Component {
  state = { previewGenerating: false };

  handlePreview = (type, values) => {
    this.setState({ previewGenerating: true });
    return this.props
      .preview(type, values)
      .finally(() => this.setState({ previewGenerating: false }));
  };

  render() {
    const errorsLength = Object.keys(this.props.formSyncErrors).length;
    const showErrors = this.props.submitFailed && errorsLength > 0;
    return (
      <div>
        {!this.props.signature && (
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
        <GenerateDocumentForm
          {...this.props}
          preview={this.handlePreview}
          previewGenerating={this.state.previewGenerating}
          initialValues={{ ...this.props.initialValues, file_type: "PDF" }}
          disabled={!this.props.signature}
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
  }
}

GenerateDocumentModal.propTypes = propTypes;
GenerateDocumentModal.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  formSyncErrors: getFormSyncErrors(FORM.GENERATE_DOCUMENT)(state),
  submitFailed: hasSubmitFailed(FORM.GENERATE_DOCUMENT)(state),
});

export default connect(mapStateToProps)(GenerateDocumentModal);

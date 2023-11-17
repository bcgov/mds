import React, { Component } from "react";
import PropTypes from "prop-types";
import { Steps, Alert } from "antd";
import { MDS_EMAIL } from "@mds/common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import GenerateDocumentForm from "@/components/Forms/GenerateDocumentForm";
import RejectApplicationForm from "@/components/Forms/noticeOfWork/RejectApplicationForm";
import IssuePermitForm from "@/components/Forms/noticeOfWork/IssuePermitForm";

const propTypes = {
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  generateDocument: PropTypes.func.isRequired,
  preview: PropTypes.func.isRequired,
  documentType: PropTypes.objectOf(PropTypes.any).isRequired,
  type: PropTypes.string.isRequired,
  signature: PropTypes.bool.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  issuingInspectorGuid: PropTypes.string,
  draftAmendment: PropTypes.objectOf(PropTypes.any).isRequired,
  exemptionFeeStatusCode: PropTypes.string,
};

const defaultProps = {
  issuingInspectorGuid: "",
  exemptionFeeStatusCode: "",
};

export class UpdateStatusGenerateLetterModal extends Component {
  state = { step: 0, submitting: false, previewGenerating: false };

  handleGenerate = (values) => {
    this.setState({ submitting: true });
    return this.props
      .generateDocument(this.props.documentType, values)
      .then(() => this.next())
      .finally(() => this.setState({ submitting: false }));
  };

  handlePreview = (type, values) => {
    this.setState({ previewGenerating: true });
    return this.props
      .preview(type, values)
      .finally(() => this.setState({ previewGenerating: false }));
  };

  close = () => this.props.closeModal();

  next = () => this.setState((prevState) => ({ step: prevState.step + 1 }));

  prev = () => this.setState((prevState) => ({ step: prevState.step - 1 }));

  renderCorrectFrom = () =>
    this.props.type === "AIA" ? (
      <IssuePermitForm
        initialValues={{
          issue_date: this.props.draftAmendment.issue_date,
          auth_end_date: this.props.draftAmendment.authorization_end_date,
          exemption_fee_status_code: this.props.exemptionFeeStatusCode,
        }}
        onSubmit={this.props.onSubmit}
        closeModal={this.props.closeModal}
        title={this.props.title}
      />
    ) : (
      <RejectApplicationForm
        onSubmit={this.props.onSubmit}
        closeModal={this.props.closeModal}
        title={this.props.title}
        type={this.props.type}
        documentType={this.props.documentType}
        prev={this.prev}
        noticeOfWork={this.props.noticeOfWork}
      />
    );

  render() {
    const steps = [
      {
        title: "Generate Letter",
        content: (
          <GenerateDocumentForm
            {...this.props}
            initialValues={{ ...this.props.initialValues, file_type: "PDF" }}
            showActions={false}
            additionalTitle="and Process"
            onSubmit={this.handleGenerate}
            submitting={this.state.submitting}
            previewGenerating={this.state.previewGenerating}
            preview={this.handlePreview}
            disabled={!this.props.signature}
            allowDocx
          />
        ),
      },
      {
        title: "Process",
        content: this.renderCorrectFrom(),
      },
    ];
    const alertMessage =
      this.props.type === "AIA"
        ? "No changes or additions can be made to this application after the permit has been issued."
        : "No changes or additions can be made to this application after it has been " +
          ` ${(this.props.type === "REJ" && "rejected") ||
            (this.props.type === "WDN" && "withdrawn") ||
            ""}.`;
    return (
      <div>
        <Alert
          message="This action is final"
          description={alertMessage}
          type="warning"
          showIcon
          style={{ textAlign: "left" }}
        />
        <br />
        {!this.props.signature && (
          <>
            <Alert
              message="Signature needed"
              description={
                <>
                  The signature for the Issuing Inspector has not been provided. Please contact the
                  MDS team at <a href={`mailto: ${MDS_EMAIL}`}>{MDS_EMAIL}</a>.
                </>
              }
              type="error"
              showIcon
              style={{ textAlign: "left" }}
            />
            <br />
          </>
        )}
        <Steps current={this.state.step}>
          {steps.map((step) => (
            <Steps.Step key={step.title} title={step.title} />
          ))}
        </Steps>
        <br />
        <div>{steps[this.state.step].content}</div>
      </div>
    );
  }
}

UpdateStatusGenerateLetterModal.propTypes = propTypes;
UpdateStatusGenerateLetterModal.defaultProps = defaultProps;

export default UpdateStatusGenerateLetterModal;

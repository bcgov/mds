import React, { Component } from "react";
import PropTypes from "prop-types";
import { Steps, Alert } from "antd";
import { MDS_EMAIL } from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import GenerateDocumentForm from "@/components/Forms/GenerateDocumentForm";
import RejectApplicationForm from "@/components/Forms/noticeOfWork/RejectApplicationForm";
import IssuePermitForm from "@/components/Forms/noticeOfWork/IssuePermitForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  generateDocument: PropTypes.func.isRequired,
  documentType: PropTypes.objectOf(PropTypes.any).isRequired,
  type: PropTypes.string.isRequired,
  signature: PropTypes.bool.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  issuingInspectorGuid: PropTypes.string,
};

const defaultProps = {
  issuingInspectorGuid: "",
};

export class UpdateStatusGenerateLetterModal extends Component {
  state = { step: 0, submitting: false };

  handleGenerate = (values) => {
    this.setState({ submitting: true });
    return this.props
      .generateDocument(this.props.documentType, values)
      .then(() => this.next())
      .finally(() => this.setState({ submitting: false }));
  };

  close = () => this.props.closeModal();

  next = () => this.setState((prevState) => ({ step: prevState.step + 1 }));

  prev = () => this.setState((prevState) => ({ step: prevState.step - 1 }));

  renderCorrectFrom = () =>
    this.props.type === "AIA" ? (
      <IssuePermitForm
        initialValues={{
          issue_date: this.props.noticeOfWork.proposed_start_date,
          auth_end_date: this.props.noticeOfWork.proposed_end_date,
        }}
        noticeOfWork={this.props.noticeOfWork}
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
            showActions={false}
            additionalTitle="and Process"
            onSubmit={this.handleGenerate}
            submitting={this.state.submitting}
            disabled={!this.props.signature}
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

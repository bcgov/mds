import React, { Component } from "react";
import PropTypes from "prop-types";
import { Steps, Alert } from "antd";
import GenerateDocumentForm from "@/components/Forms/GenerateDocumentForm";
import RejectApplicationForm from "@/components/Forms/noticeOfWork/RejectApplicationForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  generateDocument: PropTypes.func.isRequired,
  documentType: PropTypes.objectOf(PropTypes.any).isRequired,
  type: PropTypes.string.isRequired,
};

export class RejectApplicationModal extends Component {
  state = { step: 0, submitting: false };

  handleGenerate = (values) => {
    this.setState({ submitting: true });
    this.props.generateDocument(this.props.documentType, values);
    this.next();
  };

  close = () => {
    this.props.closeModal();
  };

  next = () => this.setState((prevState) => ({ step: prevState.step + 1 }));

  prev = () => this.setState((prevState) => ({ step: prevState.step - 1 }));

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
          />
        ),
      },
      {
        title: "Process",
        content: (
          <RejectApplicationForm
            onSubmit={this.props.onSubmit}
            closeModal={this.props.closeModal}
            title={this.props.title}
            type={this.props.type}
          />
        ),
      },
    ];
    return (
      <div>
        <Alert
          message="This action is final"
          description="No changes or additions can be made to this application after the permit has been rejected."
          type="warning"
          showIcon
          style={{ textAlign: "left" }}
        />
        <br />
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

RejectApplicationModal.propTypes = propTypes;

export default RejectApplicationModal;

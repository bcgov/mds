import React from "react";
import PropTypes from "prop-types";
import { Steps, Alert } from "antd";
import RejectApplicationForm from "@/components/Forms/noticeOfWork/RejectApplicationForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export const RejectApplicationModal = (props) => {
  const steps = [
    {
      title: "Generate Letter",
      content: (
        <RejectApplicationForm
          onSubmit={props.onSubmit}
          closeModal={props.closeModal}
          title={props.title}
        />
      ),
    },
    {
      title: "Process",
      content: <div>Hello</div>,
    },
  ];
  return (
    <div>
      <Steps current={1}>
        {steps.map((step) => (
          <Steps.Step key={step.title} title={step.title} />
        ))}
      </Steps>
      <Alert
        message="This action is final"
        description="No changes or additions can be made to this application after the permit has been rejected."
        type="warning"
        showIcon
        style={{ textAlign: "left" }}
      />
      <div>{steps[1].content}</div>
      <br />
    </div>
  );
};

RejectApplicationModal.propTypes = propTypes;

export default RejectApplicationModal;

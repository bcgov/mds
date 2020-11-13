import React from "react";
import PropTypes from "prop-types";
import { Alert } from "antd";
import RejectApplicationForm from "@/components/Forms/noticeOfWork/RejectApplicationForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export const RejectApplicationModal = (props) => {
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
      <RejectApplicationForm
        onSubmit={props.onSubmit}
        closeModal={props.closeModal}
        title={props.title}
        initialValues={{}}
      />
    </div>
  );
};

RejectApplicationModal.propTypes = propTypes;

export default RejectApplicationModal;

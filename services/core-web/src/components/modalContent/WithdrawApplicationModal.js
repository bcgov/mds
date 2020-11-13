import React from "react";
import PropTypes from "prop-types";
import { Alert } from "antd";
import WithdrawApplicationForm from "@/components/Forms/noticeOfWork/WithdrawApplicationForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export const WithdrawApplicationModal = (props) => {
  return (
    <div>
      <Alert
        message="This action is final"
        description="No changes or additions can be made to this application after the permit has been withdrawn."
        type="warning"
        showIcon
        style={{ textAlign: "left" }}
      />
      <br />
      <WithdrawApplicationForm
        onSubmit={props.onSubmit}
        closeModal={props.closeModal}
        title={props.title}
        initialValues={{}}
      />
    </div>
  );
};

WithdrawApplicationModal.propTypes = propTypes;

export default WithdrawApplicationModal;

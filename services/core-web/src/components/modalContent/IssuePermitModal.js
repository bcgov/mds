import React from "react";
import PropTypes from "prop-types";
import { Alert } from "antd";
import IssuePermitForm from "@/components/Forms/noticeOfWork/IssuePermitForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export const IssuePermitModal = (props) => {
  return (
    <div>
      <Alert
        message="This action is final"
        description="No changes or additions can be made to this application after the permit has been issued."
        type="warning"
        showIcon
        style={{ textAlign: "left" }}
      />
      <br />
      <IssuePermitForm
        onSubmit={props.onSubmit}
        closeModal={props.closeModal}
        title={props.title}
        initialValues={{}}
      />
    </div>
  );
};

IssuePermitModal.propTypes = propTypes;

export default IssuePermitModal;

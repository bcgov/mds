import React from "react";
import PropTypes from "prop-types";
import { Alert } from "antd";
import NOWDelayForm from "@/components/Forms/noticeOfWork/NOWDelayForm";
import NOWReasonForDelay from "@/components/noticeOfWork/applications/NOWReasonForDelay";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string),
  stage: PropTypes.string.isRequired,
};

const defaultProps = {
  initialValues: {},
};

export const NOWDelayModal = (props) => (
  <div>
    {props.stage === "Stop" && (
      <>
        <Alert
          message="Please ensure the following issue has been resolved before stopping delay."
          type="warning"
          showIcon
        />
        <br />
        <NOWReasonForDelay applicationDelay={props.initialValues} />
      </>
    )}
    <NOWDelayForm {...props} />
  </div>
);

NOWDelayModal.propTypes = propTypes;
NOWDelayModal.defaultProps = defaultProps;
export default NOWDelayModal;

import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  navigateForward: PropTypes.string.isRequired,
};

export const ImportIRTSuccessModal = (props) => (
  <div>
    <p>
      Your file has been successfully imported. In the next step you will be able to review your IRT
      before submission to the ministry.
    </p>
    <div className="ant-modal-footer">
      <Button style={{ float: "left" }} onClick={props.closeModal}>
        Close
      </Button>
      <Button type="primary" onClick={() => props.closeModal() && props.navigateForward()}>
        Continue to Review
      </Button>
    </div>
  </div>
);

ImportIRTSuccessModal.propTypes = propTypes;

export default ImportIRTSuccessModal;

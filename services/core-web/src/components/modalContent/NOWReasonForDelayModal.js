import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import NOWReasonForDelay from "@/components/noticeOfWork/applications/NOWReasonForDelay";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  applicationDelay: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const NOWReasonForDelayModal = (props) => (
  <div>
    <NOWReasonForDelay applicationDelay={props.applicationDelay} />
    <div className="right center-mobile">
      <Button type="primary" onClick={props.closeModal}>
        Okay
      </Button>
    </div>
  </div>
);

NOWReasonForDelayModal.propTypes = propTypes;

export default NOWReasonForDelayModal;

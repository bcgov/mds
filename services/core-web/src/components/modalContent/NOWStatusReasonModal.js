import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import { isEmpty } from "lodash";
import NOWReasonForDelay from "@/components/noticeOfWork/applications/NOWReasonForDelay";
import NOWStatusReason from "@/components/noticeOfWork/applications/NOWStatusReason";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  applicationDelay: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const NOWStatusReasonModal = (props) => (
  <div>
    {!isEmpty(props.applicationDelay) && (
      <NOWReasonForDelay applicationDelay={props.applicationDelay} />
    )}
    <NOWStatusReason />
    <div className="right center-mobile">
      <Button type="primary" onClick={props.closeModal}>
        Okay
      </Button>
    </div>
  </div>
);

NOWStatusReasonModal.propTypes = propTypes;

export default NOWStatusReasonModal;

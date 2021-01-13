import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import { isEmpty } from "lodash";
import NOWReasonForDelay from "@/components/noticeOfWork/applications/NOWReasonForDelay";
import NOWRejectionReason from "@/components/noticeOfWork/applications/NOWRejectionReason";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  applicationDelay: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const NOWStatusReasonModal = (props) => (
  <div>
    {!isEmpty(props.applicationDelay) && (
      <NOWReasonForDelay applicationDelay={props.applicationDelay} />
    )}
    <NOWRejectionReason />
    <div className="right center-mobile">
      <Button type="primary" onClick={props.closeModal}>
        Okay
      </Button>
    </div>
  </div>
);

NOWStatusReasonModal.propTypes = propTypes;

export default NOWStatusReasonModal;

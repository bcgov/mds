/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Descriptions, Button } from "antd";
import NOWReviewForm from "@/components/Forms/noticeOfWork/NOWReviewForm";
import { formatDate } from "@common/utils/helpers";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const NOWReasonForDelayModal = (props) => (
  <div>
    <Descriptions column={1}>
      <Descriptions.Item label="Reason for Delay">
        {props.applicationDelay[0].delay_type_code}
      </Descriptions.Item>
      <Descriptions.Item label="Comments">
        {props.applicationDelay[0].start_comment}
      </Descriptions.Item>
      <Descriptions.Item label="Start Date of delay">
        {formatDate(props.applicationDelay[0].start_date)}
      </Descriptions.Item>
    </Descriptions>
    <div className="right center-mobile">
      <Button type="primary" onClick={props.closeModal}>
        Okay
      </Button>
    </div>
  </div>
);

NOWReasonForDelayModal.propTypes = propTypes;
NOWReasonForDelayModal.defaultProps = defaultProps;
export default NOWReasonForDelayModal;

/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Descriptions, Button } from "antd";
import NOWReviewForm from "@/components/Forms/noticeOfWork/NOWReviewForm";

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
      <Descriptions.Item label="Reason for Delay">Proponent Information Required</Descriptions.Item>
      <Descriptions.Item label="Comments">comments comments comments</Descriptions.Item>
      <Descriptions.Item label="Start Date of delay">Monday, Sept 24,</Descriptions.Item>
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

/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Alert, Descriptions } from "antd";
import NOWDelayForm from "@/components/Forms/noticeOfWork/NOWDelayForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const NOWDelayModal = (props) => (
  <div>
    <NOWDelayForm {...props} />
  </div>
);

NOWDelayModal.propTypes = propTypes;
NOWDelayModal.defaultProps = defaultProps;
export default NOWDelayModal;

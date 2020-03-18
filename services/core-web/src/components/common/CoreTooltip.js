import React from "react";
import { PropTypes } from "prop-types";
import { Tooltip } from "antd";
import { INFO_CIRCLE } from "@/constants/assets";

const types = {
  "now-field-origin":
    "This field is not being sent by NROS or vFCBC. Open the original PDF to see the data.",
};

const propTypes = {
  type: PropTypes.oneOf(Object.keys(types)),
  title: PropTypes.string,
};

const defaultProps = {
  type: null,
  title: null,
};

const getTypeTitle = (type) => (type in types ? types[type] : "");

export const CoreTooltip = (props) => {
  const title = props.type ? getTypeTitle(props.type) : props.title;
  return (
    <Tooltip title={title} placement="right" mouseEnterDelay={0.3}>
      <img src={INFO_CIRCLE} alt="Info" className="info-tooltip" />
    </Tooltip>
  );
};

CoreTooltip.propTypes = propTypes;
CoreTooltip.defaultProps = defaultProps;

export default CoreTooltip;

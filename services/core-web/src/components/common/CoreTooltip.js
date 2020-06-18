import React from "react";
import { PropTypes } from "prop-types";
import { Tooltip } from "antd";
import { INFO_CIRCLE } from "@/constants/assets";

const propTypes = {
  title: PropTypes.string,
};

const defaultProps = {
  title: null,
};

const OriginalValuePropTypes = {
  originalValue: PropTypes.string.isRequired,
  isVisible: PropTypes.bool.isRequired,
};

export const CoreTooltip = (props) => (
  <Tooltip title={props.title} placement="right" mouseEnterDelay={0.3}>
    <img src={INFO_CIRCLE} alt="Info" className="info-tooltip" />
  </Tooltip>
);

export const NOWFieldOriginTooltip = () => (
  <CoreTooltip title="This field is not being sent by NROS or vFCBC. Open the original PDF to see the data." />
);

export const NOWOriginalValueTooltip = (props) => {
  // const isBool =
  //   typeof props.originalValue === Boolean ? props.originalValue.toString() : props.originalValue;

  return (
    <Tooltip
      title={`Original Value: ${props.originalValue}`}
      placement="right"
      mouseEnterDelay={0.3}
      className="position-right"
    >
      {props.isVisible && <span className="violet">Edited</span>}
    </Tooltip>
  );
};

CoreTooltip.propTypes = propTypes;
CoreTooltip.defaultProps = defaultProps;
NOWOriginalValueTooltip.propTypes = OriginalValuePropTypes;

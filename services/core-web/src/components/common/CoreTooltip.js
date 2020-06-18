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
  style: PropTypes.objectOf(PropTypes.string),
};

const OriginalValueDefaultProps = { style: {} };

export const CoreTooltip = (props) => (
  <Tooltip title={props.title} placement="right" mouseEnterDelay={0.3}>
    <img src={INFO_CIRCLE} alt="Info" className="info-tooltip" />
  </Tooltip>
);

export const NOWFieldOriginTooltip = () => (
  <CoreTooltip title="This field is not being sent by NROS or vFCBC. Open the original PDF to see the data." />
);

export const NOWOriginalValueTooltip = (props) => (
  <Tooltip
    title={`Original Value: ${props.originalValue}`}
    placement="right"
    mouseEnterDelay={0.3}
    className={!props.style.marginLeft && "position-right"}
  >
    {props.isVisible && (
      <span style={props.style} className="violet">
        Edited
      </span>
    )}
  </Tooltip>
);

CoreTooltip.propTypes = propTypes;
CoreTooltip.defaultProps = defaultProps;
NOWOriginalValueTooltip.defaultProps = OriginalValueDefaultProps;
NOWOriginalValueTooltip.propTypes = OriginalValuePropTypes;

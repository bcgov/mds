import React from "react";
import PropTypes from "prop-types";
import { CALLOUT_SEVERITY } from "../../../common/constants/strings";

const propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  severity: PropTypes.string,
};

const defaultProps = {
  severity: CALLOUT_SEVERITY.info,
};

const Callout = (props) => {
  const { severity } = props;

  if (typeof props.message === "object") {
    return <div className={`bcgov-callout--${severity} nod-callout-text`}>{props.message}</div>;
  }
  return (
    <div className={`bcgov-callout--${severity} nod-callout-text`} style={props.style}>
      <p>{props.message}</p>
    </div>
  );
};

Callout.propTypes = propTypes;
Callout.defaultProps = defaultProps;

export default Callout;

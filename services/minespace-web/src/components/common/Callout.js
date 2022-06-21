import React from "react";
import PropTypes from "prop-types";
import { CALLOUT_SEVERITY } from "../../../common/constants/strings";

const propTypes = {
  message: PropTypes.string.isRequired,
  severity: PropTypes.string,
};

const defaultProps = {
  severity: CALLOUT_SEVERITY.info,
};

const Callout = (props) => {
  const { severity } = props;

  return (
    <div className={`bcgov-callout--${severity} nod-callout-text`}>
      <p>{props.message}</p>
    </div>
  );
};
Callout.propTypes = propTypes;
Callout.defaultProps = defaultProps;

export default Callout;

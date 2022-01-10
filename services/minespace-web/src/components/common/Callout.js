import React from "react";
import PropTypes from "prop-types";

const propTypes = {
  message: PropTypes.string.isRequired,
};

const defaultProps = {};

const Callout = (props) => (
  <div className="bcgov-callout">
    <p>{props.message}</p>
  </div>
);

Callout.propTypes = propTypes;
Callout.defaultProps = defaultProps;

export default Callout;

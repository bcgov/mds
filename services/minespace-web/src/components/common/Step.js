// import React from 'react';
import PropTypes from "prop-types";

const propTypes = {
  children: PropTypes.node.isRequired,
};

const Step = (props) => {
  const { children } = props;
  return children;
};

Step.propTypes = propTypes;

export default Step;
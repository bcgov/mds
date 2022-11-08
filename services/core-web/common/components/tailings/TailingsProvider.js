import React from "react";
import PropTypes from "prop-types";
import TailingsContext from "./TailingsContext";

const propTypes = {
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
};

const TailingsProvider = (props) => {
  return <TailingsContext.Provider value={props}>{props.children}</TailingsContext.Provider>;
};

TailingsProvider.propTypes = propTypes;

export default TailingsProvider;

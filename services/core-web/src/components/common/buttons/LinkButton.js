import React from "react";
import PropTypes from "prop-types";

const propTypes = {
  onClick: PropTypes.func.isRequired,
  tabIndex: PropTypes.number,
  style: PropTypes.objectOf(PropTypes.any),
  children: PropTypes.any,
  title: PropTypes.string,
};

const defaultProps = {
  tabIndex: 0,
  style: null,
  children: null,
};

const LinkButton = (props) => (
  <a
    role="link"
    onClick={props.onClick}
    // Accessibility: Event listener
    onKeyPress={props.onClick}
    // Accessibility: Focusable element
    tabIndex={props.tabIndex}
    style={props.style}
  >
    {props.children}
  </a>
);

LinkButton.propTypes = propTypes;
LinkButton.defaultProps = defaultProps;

export default LinkButton;

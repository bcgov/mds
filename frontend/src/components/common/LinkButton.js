import React from "react";
import PropTypes from "prop-types";

const propTypes = {
  key: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  tabIndex: PropTypes.number,
  children: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  tabIndex: 0,
  children: null,
};

const LinkButton = (props) => (
  <a
    role="link"
    key={props.key}
    onClick={props.onClick}
    // Accessibility: Event listener
    onKeyPress={props.onClick}
    // Accessibility: Focusable element
    tabIndex={props.tabIndex}
  >
    {props.children}
  </a>
);

LinkButton.propTypes = propTypes;
LinkButton.defaultProps = defaultProps;

export default LinkButton;

import React from "react";
import PropTypes from "prop-types";

const propTypes = {
  onClick: PropTypes.func.isRequired,
  tabIndex: PropTypes.number,
  children: PropTypes.oneOf([
    PropTypes.string,
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
};

const defaultProps = {
  tabIndex: 0,
  children: null,
};

const LinkButton = (props) => (
  <a
    role="link"
    onClick={props.onClick}
    onKeyPress={props.onClick}
    tabIndex={props.tabIndex}
    {...props}
  >
    {props.children}
  </a>
);

LinkButton.propTypes = propTypes;
LinkButton.defaultProps = defaultProps;

export default LinkButton;

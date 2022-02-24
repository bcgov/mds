import React from "react";
import PropTypes from "prop-types";

const propTypes = {
  onClick: PropTypes.func.isRequired,
  tabIndex: PropTypes.number,
  // eslint-disable-next-line  react/forbid-prop-types
  children: PropTypes.any,
  disabled: PropTypes.bool,
};

const defaultProps = {
  tabIndex: 0,
  children: null,
  disabled: false,
};

const LinkButton = (props) => (
  <a
    role="link"
    onClick={props.onClick}
    onKeyPress={props.onClick}
    tabIndex={props.tabIndex}
    disabled={props.disabled}
    {...props}
  >
    {props.children}
  </a>
);

LinkButton.propTypes = propTypes;
LinkButton.defaultProps = defaultProps;

export default LinkButton;

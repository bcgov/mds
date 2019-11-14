import React from "react";
import { Icon, Button } from "antd";
import PropTypes from "prop-types";

/**
 * @constant AddButton  - Globally styled add button
 */

const propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any,
};

const defaultProps = {
  children: {},
};

const AddButton = (props) => (
  <Button type="primary" className="full-mobile btn--middle" {...props}>
    <Icon type="plus" theme="outlined" className="padding-small--right icon-sm" />
    {props.children}
  </Button>
);

AddButton.propTypes = propTypes;
AddButton.defaultProps = defaultProps;

export default AddButton;

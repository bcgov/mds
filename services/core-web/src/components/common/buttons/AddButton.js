import React from "react";
import { Button } from "antd";
import PropTypes from "prop-types";
import { PlusOutlined } from "@ant-design/icons";

/**
 * @constant AddButton  - Globally styled add button
 */

const propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any,
};

const defaultProps = {
  children: <></>,
};

const AddButton = (props) => (
  <Button type="primary" className="full-mobile btn--middle" {...props}>
    <PlusOutlined />
    {props.children}
  </Button>
);

AddButton.propTypes = propTypes;
AddButton.defaultProps = defaultProps;

export default AddButton;

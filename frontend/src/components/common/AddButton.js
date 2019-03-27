import React from "react";
import { Icon, Button } from "antd";

/**
 * @constant AddButton  - Globally styled add button
 */

const propTypes = {};

const AddButton = (props) => (
  <Button type="primary" className="full-mobile" {...props}>
    <Icon type="plus" theme="outlined" className="padding-small--right icon-sm" />
    {props.children}
  </Button>
);

AddButton.propTypes = propTypes;

export default AddButton;

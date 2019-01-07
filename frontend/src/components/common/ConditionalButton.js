import React from "react";
import { Button, Dropdown, Popconfirm } from "antd";
import {PropTypes, shape} from "prop-types";

import { CreateGuard } from "@/HOC/CreateGuard";
// import CustomPropTypes from "@/customPropTypes";
/**
 * @constant ConditionalButton is a conditionally rendered button depending on user permissions.
 * The component can either be a single button with an action || a dropdown with a menu passed in as a prop.
 *
 */

const propTypes = {
  handleAction: PropTypes.func,
  string: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  type: PropTypes.string,
  isDropdown: PropTypes.bool,
  overlay: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  ghost: PropTypes.bool,
  key: PropTypes.string,
  popConfirm: shape({
    placement: PropTypes.string,
    title: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    okText: PropTypes.string,
    cancelText: PropTypes.string
  })
};

const defaultProps = {
  string: "",
  ghost: false,
  key: "",
  type: "primary",
  isDropdown: false,
  popConfirm: null,
  overlay: "",
};

export const ConditionalButton = (props) => (
  <span>
    {!props.isDropdown && props.popConfirm==null && (
      <Button key={props.key} className="full-mobile" ghost={props.ghost} type={props.type} onClick={props.handleAction}>
        {props.string}
      </Button>
    )}
    {props.isDropdown && props.popConfirm==null && (
      <Dropdown overlay={props.overlay} placement="bottomLeft">
        <Button key={props.key} type={props.type}>{props.string}</Button>
      </Dropdown>
    )}
    {props.popConfirm!=null && (
      <Popconfirm
        {...props.popConfirm}
      >
        <Button key={props.key} className="full-mobile" ghost={props.ghost} type={props.type} onClick={props.handleAction}>
          {props.string}
        </Button>
      </Popconfirm>
    )}


  </span>
);

ConditionalButton.propTypes = propTypes;
ConditionalButton.defaultProps = defaultProps;

export default CreateGuard(ConditionalButton);

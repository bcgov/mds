import React from "react";
import { Button, Dropdown, Popconfirm } from "antd";
import { isNull, noop } from "lodash";
import { PropTypes, shape } from "prop-types";

import { CreateGuard } from "@/HOC/CreateGuard";
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
  popConfirm: shape({
    placement: PropTypes.string,
    title: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    okText: PropTypes.string,
    cancelText: PropTypes.string
  })
};

const defaultProps = {
  handleAction: noop,
  string: "",
  ghost: false,
  type: "primary",
  isDropdown: false,
  popConfirm: null,
  overlay: "",
};

export const ConditionalButton = (props) => (
  <span>
    {!props.isDropdown && isNull(props.popConfirm) && (
      <Button className="full-mobile" ghost={props.ghost} type={props.type} onClick={props.handleAction}>
        {props.string}
      </Button>
    )}
    {props.isDropdown && (
      <Dropdown className="full-height" overlay={props.overlay} placement="bottomLeft">
        <Button type={props.type}>{props.string}</Button>
      </Dropdown>
    )}
    {props.popConfirm && (
      <Popconfirm
        {...props.popConfirm}
      >
        <Button className="full-mobile" ghost={props.ghost} type={props.type} onClick={props.handleAction}>
          {props.string}
        </Button>
      </Popconfirm>
    )}
  </span>
);

ConditionalButton.propTypes = propTypes;
ConditionalButton.defaultProps = defaultProps;

export default CreateGuard(ConditionalButton);

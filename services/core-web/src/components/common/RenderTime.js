import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { TimePicker } from "antd";

/**
 * @constant RenderTime  - Ant Design `TimePicker` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  placeholder: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  format: PropTypes.string,
  defaultOpenValue: PropTypes.string,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
};

const defaultProps = {
  placeholder: "Select a time",
  onBlur: () => {},
  onChange: () => {},
  format: "HH:mm",
  defaultOpenValue: "00:00",
  fullWidth: false,
  disabled: false,
};

const RenderDate = (props) => (
  <Form.Item
    label={props.label}
    validateStatus={
      props.meta.touched ? (props.meta.error && "error") || (props.meta.warning && "warning") : ""
    }
    help={
      props.meta.touched &&
      ((props.meta.error && <span>{props.meta.error}</span>) ||
        (props.meta.warning && <span>{props.meta.warning}</span>))
    }
  >
    <TimePicker
      disabled={props.disabled}
      id={props.id}
      {...props.input}
      placeholder={props.placeholder}
      onChange={props.input.onChange}
      onBlur={props.onBlur}
      value={props.input.value ? moment(props.input.value, props.format) : null}
      defaultOpenValue={moment(props.defaultOpenValue, props.format)}
      format={props.format}
      className={props.fullWidth && "full"}
    />
  </Form.Item>
);

RenderDate.propTypes = propTypes;
RenderDate.defaultProps = defaultProps;

export default RenderDate;

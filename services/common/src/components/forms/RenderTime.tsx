import React, { FC } from "react";
import moment from "moment-timezone";
import { Form, TimePicker } from "antd";
import { BaseInputProps } from "./BaseInput";

/**
 * @constant RenderTime  - Ant Design `TimePicker` component for redux-form.
 */

interface RenderTimeProps extends BaseInputProps {
  fullWidth: boolean;
  onBlur?: () => void;
  onChange?: () => void;
  format?: string;
}

const RenderTime: FC<RenderTimeProps> = ({
  placeholder = "Select a time",
  format = "HH:mm",
  defaultValue = "00:00",
  fullWidth = false,
  ...props
}) => (
  <Form.Item
    name={props.input.name}
    required={props.required}
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
      placeholder={placeholder}
      onChange={props.input.onChange}
      onBlur={props.onBlur}
      value={props.input.value ? moment(props.input.value, format) : null}
      defaultValue={moment(defaultValue, format)}
      format={format}
      className={fullWidth && "full"}
    />
  </Form.Item>
);

export default RenderTime;

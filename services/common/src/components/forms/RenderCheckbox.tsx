import React, { FC } from "react";
import { Checkbox, Form } from "antd";
import { BaseInputProps } from "./BaseInput";
/**
 * @constant RenderCheckbox - Ant Design `Checkbox` component for redux-form.
 */

interface CheckboxProps extends BaseInputProps {
  label: string;
}

const RenderCheckbox: FC<CheckboxProps> = ({
  input,
  meta,
  id,
  disabled = false,
  label,
  ...props
}) => {
  const onChange = (e) => {
    input.onChange(e.target.checked);
  };
  return (
    <Form.Item
      name={input.name}
      validateStatus={meta.touched ? meta.error && "error" : ""}
      required={props.required}
      className={props.required && "ant-form-item-checkbox-required"}
      help={
        meta.touched &&
        ((meta.error && <span>{meta.error}</span>) || (meta.warning && <span>{meta.warning}</span>))
      }
    >
      <Checkbox id={id} checked={input.value} disabled={disabled} onChange={onChange}>
        {label}
      </Checkbox>
    </Form.Item>
  );
};

export default RenderCheckbox;

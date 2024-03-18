import React, { FC } from "react";
import { Checkbox, Form } from "antd";
import { BaseInputProps } from "./BaseInput";

/**
 * @constant RenderGroupCheckbox - Ant Design `Checkbox` component for redux-form.
 * NOTE ABOUT A REDUX BUG AFFECTING THIS COMPONENT:
 * Exactly what's happening here: https://github.com/redux-form/redux-form/issues/2768
 * - When onBlur is called, it calls onChange to update the value
 * - but with a group checkbox, it does it with the value of the individual checkbox,
 * - not with the value of the group
 * - so it will call onChange(true | false) instead of onChange(["val1", "val2"])
 * - which causes an error.
 * - And event.preventDefault() on the onBlur also prevents validation
 * - The best and easiest solution I found was to put a normalize function on the <Field />
 * - to not update the value if it's not an array (normalize gets called first)
 * - It is exported here as normalizeGroupCheckBox
 */

interface CheckboxProps extends BaseInputProps {
  label: string;
  options: any;
  defaultValue: any[];
}

export const normalizeGroupCheckBox = (val, prev) => (Array.isArray(val) ? val : prev);

const RenderGroupCheckbox: FC<CheckboxProps> = ({
  meta,
  input,
  label,
  options,
  required,
  ...props
}) => {
  return (
    <Form.Item
      name={input.name}
      label={label}
      required={required}
      validateStatus={meta.touched ? meta.error && "error" : ""}
      help={
        meta.touched &&
        ((meta.error && <span>{meta.error}</span>) || (meta.warning && <span>{meta.warning}</span>))
      }
      getValueProps={() => ({ value: input.value })}
    >
      <Checkbox.Group
        name={input.name}
        options={options}
        disabled={props.disabled}
        defaultValue={props.defaultValue}
        {...input}
      />
    </Form.Item>
  );
};

export default RenderGroupCheckbox;

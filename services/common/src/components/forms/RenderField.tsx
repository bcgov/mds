import React, { FC } from "react";
import { Input, Form } from "antd";
import { BaseInputProps, BaseViewInput, getFormItemLabel } from "./BaseInput";
import { FormConsumer } from "./FormWrapper";

/**
 * @constant RenderField - Ant Design `Input` component for redux-form.
 */

const RenderField: FC<BaseInputProps> = ({
  label,
  meta,
  input,
  disabled,
  required,
  defaultValue,
  id,
  placeholder,
  allowClear,
}) => {
  return (
    <FormConsumer>
      {(value) => {
        if (!value.isEditMode) {
          return <BaseViewInput label={label} value={input?.value} />;
        }
        return (
          <Form.Item
            name={input.name}
            required={required}
            label={getFormItemLabel(label, required)}
            validateStatus={
              meta.touched ? (meta.error && "error") || (meta.warning && "warning") : ""
            }
            help={
              meta.touched &&
              ((meta.error && <span>{meta.error}</span>) ||
                (meta.warning && <span>{meta.warning}</span>))
            }
          >
            <Input
              disabled={disabled}
              defaultValue={defaultValue}
              id={id}
              placeholder={placeholder}
              allowClear={allowClear}
              {...input}
            />
          </Form.Item>
        );
      }}
    </FormConsumer>
  );
};

export default RenderField;

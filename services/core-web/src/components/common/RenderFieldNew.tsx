import React from "react";
import { Form, Input } from "antd";
import { BaseInputProps, FormConsumer, ViewFormDataItem } from "@mds/common/components/FormWrapper";

const RenderFieldNew = ({
  label = "",
  id,
  // defaultValue="",
  placeholder = "",
  meta,
  input,
  disabled = false,
  allowClear = false,
  required = false,
}: BaseInputProps) => {
  const formItem = () => (
    <Form.Item
      name={input.name}
      label={label}
      required={required}
      validateStatus={meta.touched ? (meta.error && "error") || (meta.warning && "warning") : ""}
      help={
        meta.touched &&
        ((meta.error && <span>{meta.error}</span>) || (meta.warning && <span>{meta.warning}</span>))
      }
    >
      <Input
        name={input.name}
        disabled={disabled}
        defaultValue={input?.value}
        id={id}
        placeholder={placeholder}
        allowClear={allowClear}
        {...input}
      />
    </Form.Item>
  );

  return (
    <FormConsumer>
      {(value) => (value.view ? ViewFormDataItem(label, input?.value) : formItem())}
    </FormConsumer>
  );
};

export default RenderFieldNew;

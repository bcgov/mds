import React, { useEffect, useState } from "react";
import { Form, Input } from "antd";
import { BaseInputProps, FormConsumer, ViewFormDataItem } from "@mds/common/components/FormWrapper";

interface RenderAutoSizeFieldProps extends BaseInputProps {
  minRows: number;
  maximumCharacters: number;
}

const RenderAutoSizeFieldNew = ({
  label = "",
  id,
  // defaultValue="",
  placeholder = "",
  meta,
  input,
  disabled = false,
  // allowClear=false,
  required = false,
  minRows = 3,
  maximumCharacters = 0,
}: RenderAutoSizeFieldProps) => {
  const [remainingChars, setRemainingChars] = useState(maximumCharacters);
  const [value, setValue] = useState(input?.value ?? "");

  const handleTextAreaChange = (event) => {
    setValue(event.target.value);
    if (maximumCharacters > 0) {
      const input = event.target.value;
      const remaining = maximumCharacters - input.length;
      setRemainingChars(remaining);
    }
  };

  useEffect(() => {
    if (input) {
      const inputValue = input.value;
      const remaining = maximumCharacters - inputValue.length;
      setRemainingChars(remaining);
    }
  }, []);

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
      <Input.TextArea
        name={input.name}
        disabled={disabled}
        id={id}
        placeholder={placeholder}
        autoSize={{ minRows: minRows }}
        onChange={handleTextAreaChange}
        value={value}
        {...input}
      />
      {maximumCharacters > 0 && (
        <div className="flex between">
          <span>{`Maximum ${maximumCharacters} characters`}</span>
          <span className="flex-end">{`${remainingChars} / ${maximumCharacters}`}</span>
        </div>
      )}
    </Form.Item>
  );

  return (
    <FormConsumer>
      {(value) => (value.view ? ViewFormDataItem(label, input?.value) : formItem())}
    </FormConsumer>
  );
};

export default RenderAutoSizeFieldNew;

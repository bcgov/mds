import React, { useState } from "react";
import { DatePicker, Form } from "antd";
import { BaseInputProps, FormConsumer, ViewFormDataItem } from "@mds/common/components/FormWrapper";
import moment from "moment-timezone";

interface DateInputProps extends BaseInputProps {
  showTime: boolean;
}

const RenderDateNew = ({
  label = "",
  id,
  // defaultValue="",
  showTime = false,
  placeholder = "",
  meta,
  input,
  disabled = false,
  allowClear = false,
  required = false,
}: DateInputProps) => {
  // TODO: issues with isTouched- this works here BUT not triggered by submit
  const defaultValue = input.value ? moment(input.value) : null;
  const [isTouched, setIsTouched] = useState(meta.touched ?? false);

  const formItem = () => {
    return (
      <Form.Item
        name={input.name}
        label={label}
        required={required}
        validateStatus={isTouched ? (meta.error && "error") || (meta.warning && "warning") : ""}
        help={
          isTouched &&
          ((meta.error && <span>{meta.error}</span>) ||
            (meta.warning && <span>{meta.warning}</span>))
        }
      >
        <DatePicker
          id={id}
          name={input.name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          allowClear={allowClear}
          disabled={disabled}
          onBlur={() => setIsTouched(true)}
          onChange={(date, dateString) => input.onChange(dateString || null)}
          value={input.value ? moment(input.value) : null}
          showTime={showTime && { format: "HH:mm" }}
          format={showTime && "YYYY-MM-DD HH:mm"}
        />
      </Form.Item>
    );
  };

  return (
    <FormConsumer>
      {(value) => (value.view ? ViewFormDataItem(label, input?.value) : formItem())}
    </FormConsumer>
  );
};

export default RenderDateNew;

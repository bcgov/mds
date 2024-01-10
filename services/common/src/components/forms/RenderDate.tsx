import React, { FC } from "react";
import moment from "moment-timezone";
import { DatePicker, Form } from "antd";
import { BaseInputProps, BaseViewInput, getFormItemLabel } from "./BaseInput";
import { FormConsumer } from "./FormWrapper";

/**
 * @constant RenderDate  - Ant Design `DatePicker` component for redux-form.
 */

interface DateInputProps extends BaseInputProps {
  showTime?: boolean;
  yearMode?: boolean;
  disabledDate?: (currentDate) => boolean;
}

const RenderDate: FC<DateInputProps> = ({
  label = "",
  meta,
  input,
  disabled = false,
  required,
  id,
  placeholder = "",
  allowClear,
  showTime = false,
  yearMode = false,
  disabledDate,
}) => {
  return (
    <FormConsumer>
      {(value) => {
        if (!value.isEditMode) {
          return <BaseViewInput label={label} value={input?.value} />;
        }
        // TS is very angry when showTime & picker are both passed as props
        let extraProps: any = {};
        if (showTime) {
          extraProps = {
            format: "YYYY-MM-DD HH:mm",
            showTime: { format: "HH:mm" },
          };
        } else if (yearMode) {
          extraProps = {
            format: "YYYY",
            picker: "year",
          };
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
            <DatePicker
              disabled={disabled}
              id={id}
              allowClear={allowClear}
              {...input}
              placeholder={placeholder}
              onChange={(date, dateString) => {
                input.onChange(dateString || null);
              }}
              value={input.value ? moment(input.value) : null}
              disabledDate={!showTime && disabledDate}
              {...(!showTime && disabledDate)}
              {...extraProps}
            />
          </Form.Item>
        );
      }}
    </FormConsumer>
  );
};

export default RenderDate;

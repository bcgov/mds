import React, { FC } from "react";
import "@ant-design/compatible/assets/index.css";
import { Form, Select } from "antd";
import { WrappedFieldProps } from "redux-form";

/**
 * @constant RenderSelect - Ant Design `Select` component for redux-form - used for small data sets that (< 100);
 * There is a bug when the data sets are large enough to cause the dropdown to scroll, and the field is in a modal.
 */

interface SelectProps extends WrappedFieldProps {
  id: string;
  input: any;
  placeholder?: string;
  label?: string;
  meta: any; //CustomPropTypes.formMeta,
  data: any; //CustomPropTypes.options,
  disabled: boolean;
  onSelect: any;
  usedOptions: string[];
  allowClear?: any;
}

export const RenderSelect: FC<SelectProps> = ({
  placeholder = "Please select",
  data = [],
  onSelect = () => {},
  allowClear = true,
  ...props
}) => {
  return (
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
      id={props.id}
      // following 4 properties do not exist
      //   onSelect={props.onSelect}
      //   defaultValue={props.input.value}
      //   value={props.input.value ? props.input.value : null}
      //   onChange={props.input.onChange}
    >
      <Select
        virtual={false}
        disabled={props.disabled}
        allowClear={allowClear}
        dropdownMatchSelectWidth
        getPopupContainer={(trigger) => trigger.parentNode}
        showSearch
        dropdownStyle={{ zIndex: 100000, position: "relative" }}
        placeholder={placeholder}
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children
            .toString()
            .toLowerCase()
            .indexOf(input.toLowerCase()) >= 0
        }
        id={props.id}
        defaultValue={props.input.value}
        value={props.input.value ? props.input.value : null}
        onChange={props.input.onChange}
        onSelect={onSelect}
      >
        {data.map((opt) => (
          <Select.Option
            style={{ zIndex: 10000, position: "relative" }}
            disabled={props.usedOptions && props.usedOptions.includes(opt.value)}
            key={opt.value}
            value={opt.value}
          >
            {opt.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default RenderSelect;

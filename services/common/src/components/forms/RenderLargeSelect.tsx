import React, { FC } from "react";
import { Select, Form } from "antd";
import { BaseInputProps } from "./BaseInput";
import { IOption } from "@mds/common/interfaces/common/option.interface";

/**
 * @component RenderLargeSelect - Ant Design `AutoComplete` component for redux-form -- being used instead of 'RenderSelect' for large data sets that require a limit.
 */
interface LargeSelectProps extends BaseInputProps {
  dataSource: any[];
  handleSearch?: (value) => void | Promise<void>;
  handleSelect?: (value, option) => void | Promise<void>;
  handleFocus?: () => void | Promise<void>;
  selectedOption?: IOption

}

const RenderLargeSelect: FC<LargeSelectProps> = ({
  handleFocus = () => { },
  handleSearch,
  handleSelect,
  dataSource = [],
  ...props
}) => {
  const selectedInData = dataSource.includes((opt) => props.selectedOption?.value === opt.value);
  const data = dataSource;
  if (props.selectedOption?.value && !selectedInData) {
    data.unshift(props.selectedOption)
  }
  return (
    <Form.Item
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
      <Select
        loading={props.loading}
        virtual={false}
        disabled={props.disabled}
        id={props.id}
        dropdownMatchSelectWidth
        showSearch
        style={{ width: "100%" }}
        defaultActiveFirstOption={false}
        placeholder={props.placeholder}
        notFoundContent="Not Found"
        options={data}
        filterOption={() => true}
        value={props.selectedOption?.value}
        onSearch={handleSearch}
        onSelect={handleSelect}
        onChange={props.input.onChange}
        onFocus={(event) => {
          handleFocus();
          props.input.onFocus(event);
        }}
      />
    </Form.Item>
  )
};

export default RenderLargeSelect;

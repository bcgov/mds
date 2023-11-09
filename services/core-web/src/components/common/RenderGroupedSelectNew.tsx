import React from "react";
import { Form, Select } from "antd";
import { BaseInputProps, FormConsumer, ViewFormDataItem } from "@mds/common/components/FormWrapper";
import { IGroupedDropdownList } from "@mds/common";

interface RenderSelectProps extends BaseInputProps {
  data: IGroupedDropdownList[]; // doesn't actually match what it wants
  onSelect: any;
  usedOptions: any[];
}

const RenderGroupedSelectNew = ({
  label = "",
  id,
  // defaultValue="",
  placeholder = "",
  meta,
  input,
  data = [],
  onSelect = () => {},
  disabled = false,
  allowClear = false,
  required = false,
}: RenderSelectProps) => {
  const options = data.map((group) => {
    return {
      label: group.groupName,
      options: group.opt,
    };
  });

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
      <Select
        virtual={false}
        disabled={disabled}
        dropdownMatchSelectWidth
        showSearch
        placeholder={placeholder}
        optionFilterProp="children"
        id={id}
        defaultValue={input.value}
        value={input.value ? input.value : undefined}
        onChange={input.onChange}
        onSelect={onSelect}
        options={options}
        allowClear={allowClear}
      />
    </Form.Item>
  );

  const viewItem = () => {
    // find the item and what to label it
    const allOptions = options.reduce(
      (accumulator, optGroup) => [...accumulator, ...optGroup.options],
      []
    );
    const item = allOptions.find((item) => item.value === input?.value);
    return ViewFormDataItem(label, item?.label);
  };

  return <FormConsumer>{(value) => (value.view ? viewItem() : formItem())}</FormConsumer>;
};

export default RenderGroupedSelectNew;

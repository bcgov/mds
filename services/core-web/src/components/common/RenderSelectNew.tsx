import React from "react";
import { Form, Select } from "antd";
import { BaseInputProps, FormConsumer, ViewFormDataItem } from "@mds/common/components/FormWrapper";
import { IOption } from "@mds/common";

interface RenderSelectProps extends BaseInputProps {
  data: IOption[]; // doesn't actually match what it wants
  onSelect: any;
  usedOptions: any[];
}

const RenderSelectNew = ({
  label = "",
  id,
  // defaultValue="", // this messes up search functionality
  placeholder = "Please select",
  meta, // CustomPropTypes.formMeta,
  input,
  data = [],
  onSelect = () => {},
  disabled = false,
  allowClear = true, // bit of an anomaly!
  required = false,
}: RenderSelectProps) => {
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
        getPopupContainer={(trigger) => trigger.parentNode}
        showSearch
        dropdownStyle={{ zIndex: 100000, position: "relative" }}
        placeholder={placeholder}
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        id={id}
        defaultValue={input.value ? input.value : undefined}
        value={input.value ? input.value : undefined}
        onChange={input.onChange}
        onSelect={onSelect}
        options={data}
        allowClear={allowClear}
      />
    </Form.Item>
  );
  const viewItem = () => {
    const selectedItem = data.find((item) => item.value === input?.value);
    return ViewFormDataItem(label, selectedItem?.label);
  };

  return <FormConsumer>{(value) => (value.view ? viewItem() : formItem())}</FormConsumer>;
};

export default RenderSelectNew;

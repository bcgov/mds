import React from "react";
import { Select, Form, Spin } from "antd";
import { FormConsumer, IFormContext } from "./FormWrapper";
import { BaseInputProps, BaseViewInput, getFormItemLabel } from "./BaseInput";

interface IRenderAutoCompleteProps {
  data: Array<{ label: string; value: any }>;
  addMissing: boolean; // Add the input value to the list of selectable values if it doesn't exist
  style?: React.CSSProperties;
  handleChange: (value: string) => void;
  handleSelect: (value: any) => void;
}

const RenderAutoComplete = (props: BaseInputProps & IRenderAutoCompleteProps) => {
  const items = [...props.data];

  if (props.addMissing && props.input?.value?.trim().length > 0) {
    const isInputInList = items.find((item) => item.label === props.input.value);

    if (!isInputInList) {
      items.push({
        label: props.input.value,
        value: props.input.value,
      });
    }
  }
  return (
    <FormConsumer>
      {(value: IFormContext) => {
        if (!value.isEditMode) {
          return <BaseViewInput value={props.input.value} label={props.label} />;
        }

        const ariaLabel = props.label && props.label instanceof String ? props.label + "" : props.input.name;

        return (
          <Form.Item
            label={getFormItemLabel(props.label, props.required, props.labelSubtitle)}
            validateStatus={
              props.meta.touched ? (props.meta.error && "error") || (props.meta.warning && "warning") : ""
            }
            required={props.required}
            help={
              props.meta.touched &&
              ((props.meta.error && <span>{props.meta.error}</span>) ||
                (props.meta.warning && <span>{props.meta.warning}</span>))
            }
          >
            <Select
              aria-label={ariaLabel}
              showSearch
              virtual={false}
              defaultActiveFirstOption={false}
              aria-busy={props.loading}
              notFoundContent={props.loading ? <Spin size="small" /> : "Not found"}
              allowClear
              dropdownMatchSelectWidth
              defaultValue={props.input ? props.input.value : undefined}
              value={props.input ? props.input.value : undefined}
              style={{ width: "100%", ...(props.style || {}) }}
              options={items}
              placeholder={props.placeholder}
              filterOption={(input, option) =>
                option.label
                  .toString()
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
              disabled={props.disabled}
              onChange={props.input ? props.input.onChange : undefined}
              onSelect={props.handleSelect}
              onSearch={(event) => {
                props.handleChange(event);
                if (props.input) {
                  props.input.onChange(event);
                }
              }}
            />
          </Form.Item>);
      }}</FormConsumer>
  );
};

export default RenderAutoComplete;

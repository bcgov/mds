import React, { FC, useState } from "react";
import { Form, Select } from "antd";
import { BaseInputProps, BaseViewInput } from "./BaseInput";
import { IOption } from "../..";
import { caseInsensitiveLabelFilter } from "@mds/common/redux/utils/helpers";
import { FormConsumer, IFormContext } from "./FormWrapper";

/**
 * @constant RenderSelect - Ant Design `Select` component for redux-form - used for small data sets that (< 100);
 * There is a bug when the data sets are large enough to cause the dropdown to scroll, and the field is in a modal.
 */

interface SelectProps extends BaseInputProps {
  data: IOption[];
  onSelect?: (value, option) => void;
  usedOptions: string[];
  allowClear?: boolean;
}

export const RenderSelect: FC<SelectProps> = ({
  label = "",
  id,
  meta,
  input,
  placeholder = "Please select",
  data = [],
  onSelect = () => {},
  allowClear = true,
  disabled = false,
  required = false,
}) => {
  const [isDirty, setIsDirty] = useState(meta.touched);
  return (
    <FormConsumer>
      {(value: IFormContext) => {
        if (!value.isEditMode) {
          let displayedValue = "";
          if (input?.value) {
            const selectedOption = data.find((opt) => opt.value === input.value);
            displayedValue = selectedOption.label ?? "";
          }
          return <BaseViewInput value={displayedValue} label={label} />;
        }

        const formLabel = required ? label : `${label} (optional)`;

        return (
          <Form.Item
            name={input.name}
            label={formLabel}
            required={required}
            validateStatus={
              isDirty || meta.touched ? (meta.error && "error") || (meta.warning && "warning") : ""
            }
            help={
              (isDirty || meta.touched) &&
              ((meta.error && <span>{meta.error}</span>) ||
                (meta.warning && <span>{meta.warning}</span>))
            }
            id={id}
          >
            <Select
              virtual={false}
              disabled={disabled}
              allowClear={allowClear}
              dropdownMatchSelectWidth
              getPopupContainer={(trigger) => trigger.parentNode}
              showSearch
              dropdownStyle={{ zIndex: 100000, position: "relative" }}
              placeholder={placeholder}
              optionFilterProp="children"
              filterOption={caseInsensitiveLabelFilter}
              id={id}
              value={data.length && input.value ? input.value : null}
              onChange={(value) => {
                setIsDirty(true);
                input.onChange(value);
              }}
              onDropdownVisibleChange={(open) => {
                if (!open) {
                  setIsDirty(true);
                }
              }}
              onSelect={onSelect}
              options={data}
            />
          </Form.Item>
        );
      }}
    </FormConsumer>
  );
};

export default RenderSelect;

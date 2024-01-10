import React, { FC } from "react";
import { Select, Form } from "antd";
import { caseInsensitiveLabelFilter } from "@mds/common/redux/utils/helpers";
import { BaseInputProps, BaseViewInput, getFormItemLabel } from "./BaseInput";
import { FormConsumer, IFormContext } from "./FormWrapper";
import { IOption } from "../..";

/**
 * @constant RenderSelect - Ant Design `Select` component for redux-form - used for small data sets that (< 100);
 */

interface MultiSelectProps extends BaseInputProps {
  data: IOption[];
  filterOption?: any;
  onSearch?: any;
}

export const RenderMultiSelect: FC<MultiSelectProps> = (props) => {
  const {
    placeholder = "",
    data = [],
    disabled = false,
    onSearch = () => {},
    filterOption = false,
    label = "",
    meta,
    input,
  } = props;
  return (
    <FormConsumer>
      {(value: IFormContext) => {
        const { isEditMode, isModal } = value;

        if (!isEditMode) {
          const stringValue = "";
          return <BaseViewInput value={stringValue} label={label} />;
        }

        const extraProps = isModal ? null : { getPopupContainer: (trigger) => trigger.parentNode };
        return (
          <div>
            <Form.Item
              name={input.name}
              required={props.required}
              label={getFormItemLabel(label, props.required)}
              validateStatus={
                meta.touched ? (meta.error && "error") || (meta.warning && "warning") : ""
              }
              help={
                meta.touched &&
                ((meta.error && <span>{meta.error}</span>) ||
                  (meta.warning && <span>{meta.warning}</span>))
              }
            >
              <Select
                loading={props.loading}
                style={{ width: "100%" }}
                virtual={false}
                disabled={!data.length || disabled}
                mode="multiple"
                size="small"
                placeholder={placeholder}
                {...input}
                id={props.id}
                onSearch={onSearch}
                options={data}
                value={input.value ?? undefined}
                onChange={input.onChange}
                filterOption={filterOption || caseInsensitiveLabelFilter}
                showArrow
                {...extraProps}
              ></Select>
            </Form.Item>
          </div>
        );
      }}
    </FormConsumer>
  );
};

export default RenderMultiSelect;

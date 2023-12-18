import React, { FC } from "react";
import { WrappedFieldProps } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Select } from "antd";
import { caseInsensitiveLabelFilter } from "@mds/common/redux/utils/helpers";

/**
 * @constant RenderSelect - Ant Design `Select` component for redux-form - used for small data sets that (< 100);
 */

interface MultiSelectProps extends WrappedFieldProps {
  id: string;
  input: any;
  placeholder?: string;
  label?: string;
  meta: any; //CustomPropTypes.formMeta, made required for redux
  data: any[]; //CustomPropTypes.options,
  filterOption?: any;
  disabled?: boolean;
  onSearch?: any;
  isModal?: boolean;
}

export const RenderMultiSelect: FC<MultiSelectProps> = ({
  placeholder = "",
  data = [],
  disabled = false,
  onSearch = () => {},
  filterOption = false,
  isModal = false,
  ...props
}) => {
  const extraProps = isModal ? null : { getPopupContainer: (trigger) => trigger.parentNode };
  return (
    <div>
      <Form.Item
        label={props.label || ""}
        validateStatus={
          props.meta.touched
            ? (props.meta.error && "error") || (props.meta.warning && "warning")
            : ""
        }
        help={
          props.meta.touched &&
          ((props.meta.error && <span>{props.meta.error}</span>) ||
            (props.meta.warning && <span>{props.meta.warning}</span>))
        }
      >
        <Select
          virtual={false}
          disabled={!data || disabled}
          mode="multiple"
          size="small"
          placeholder={placeholder}
          id={props.id}
          onSearch={onSearch}
          value={props.input.value ? props.input.value : undefined}
          onChange={props.input.onChange}
          filterOption={filterOption || caseInsensitiveLabelFilter}
          showArrow
          {...extraProps}
        >
          {data &&
            data.map(({ value, label, tooltip }) => (
              <Select.Option key={value} value={value} title={tooltip}>
                {label}
              </Select.Option>
            ))}
        </Select>
      </Form.Item>
    </div>
  );
};

export default RenderMultiSelect;

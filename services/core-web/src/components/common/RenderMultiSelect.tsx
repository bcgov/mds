import React, { FC, useRef } from "react";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Select } from "antd";
import { caseInsensitiveLabelFilter } from "@common/utils/helpers";
import { debounce} from "lodash";
import { WrappedFieldMetaProps } from "redux-form";
import { IOption } from "@mds/common/interfaces";

/**
 * @constant RenderSelect - Ant Design `Select` component for redux-form - used for small data sets that (< 100);
 */
interface RenderMultiSelectProps {
  id: string,
  input: any,
  placeholder?: string,
  label?: string,
  meta: WrappedFieldMetaProps,
  data: IOption[],
  filterOption: (input: any, option: any) => void | boolean,
  disabled: boolean,
  onSearch: (value: any) => void,
  isModal: boolean,
};

export const RenderMultiSelect: FC<RenderMultiSelectProps> = ({
  placeholder = "",
  label = "",
  data = [],
  disabled = false,
  meta = { touched: false},
  onSearch = () => { },
  filterOption = false,
  isModal = false,
  ...rest
}) => {
  const debouncedSearch = useRef(debounce(onSearch, 500)).current;

  const extraProps = isModal ? null : { getPopupContainer: (trigger) => trigger.parentNode };
  return (
    <div>
      <Form.Item
        label={label}
        validateStatus={
          meta.touched
            ? (meta.error && "error") || (meta.warning && "warning")
            : ""
        }
        help={
          meta.touched &&
          ((meta.error && <span>{meta.error}</span>) ||
            (meta.warning && <span>{meta.warning}</span>))
        }
      >
        <Select
          virtual={false}
          disabled={!data || disabled}
          mode="multiple"
          size="small"
          placeholder={placeholder}
          id={rest.id}
          onSearch={debouncedSearch}
          value={rest.input.value ? rest.input.value : undefined}
          onChange={rest.input.onChange}
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

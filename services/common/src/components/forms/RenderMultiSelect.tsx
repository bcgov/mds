import React, { FC, ReactNode, useRef } from "react";
import { Select, Form, Typography } from "antd";
import { caseInsensitiveLabelFilter } from "@mds/common/redux/utils/helpers";
import { debounce } from "lodash";
import { BaseInputProps, getFormItemLabel } from "./BaseInput";
import { FormConsumer, IFormContext } from "./FormWrapper";
import { IOption } from "@mds/common/interfaces/common/option.interface";
import { EMPTY_FIELD } from "@mds/common/constants/strings";

/**
 * @constant RenderSelect - Ant Design `Select` component for redux-form - used for small data sets that (< 100);
 */

interface MultiSelectProps extends BaseInputProps {
  data: IOption[];
  filterOption?: any;
  onSearch?: any;
  loading?: boolean;
  viewDisplay?: (opts: IOption[]) => ReactNode;
  enableGetPopupContainer?: boolean;
}

const defaultViewDisplay = (opts: IOption[]): ReactNode => {
  if (!opts.length) {
    return <div className="multi-select-view">
      <Typography.Paragraph className="view-item-value">
        {EMPTY_FIELD}
      </Typography.Paragraph>
    </div>
  }
  return <ul className="multi-select-view margin-large--left">
    {opts.map((opt) =>
      <li key={opt.value}>
        <Typography.Paragraph key={opt.value} className="view-item-value">{opt.label}</Typography.Paragraph>
      </li>
    )}
  </ul>
};

export const RenderMultiSelect: FC<MultiSelectProps> = (props) => {
  const {
    placeholder = "",
    data = [],
    disabled = false,
    onSearch = () => { },
    filterOption = false,
    enableGetPopupContainer = false,
    label = "",
    viewDisplay = defaultViewDisplay,
    showNA,
    meta,
    input,
    help,
  } = props;
  const debouncedSearch = useRef(debounce(onSearch, 500)).current;

  return (
    <FormConsumer>
      {(value: IFormContext) => {
        const { isEditMode, isModal } = value;
        if (!isEditMode) {
          const selectedOptions = data.filter((opt) => input.value.includes(opt.value));

          return <div className="view-item ant-form-item">
            {label && label !== "" && (
              <Typography.Paragraph className="view-item-label">{label}</Typography.Paragraph>
            )}
            {(input.value.length > 0 || showNA) && (viewDisplay(selectedOptions))}
          </div>
        }

        const extraProps = isModal || enableGetPopupContainer ? null : { getPopupContainer: (trigger) => trigger.parentNode };
        return (
          <div className="form-multiselect">
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
                disabled={!data || disabled}
                mode="multiple"
                size="small"
                placeholder={placeholder}
                id={props.id ?? props.input.name}
                onSearch={debouncedSearch}
                options={data}
                value={input.value === "" ? [] : input.value}
                onChange={input.onChange}
                filterOption={filterOption || caseInsensitiveLabelFilter}
                aria-required={props.required}
                showArrow
                {...extraProps}
              ></Select>
              {help && <div className={`form-item-help ${input?.name}-form-help`}>{help}</div>}
            </Form.Item>
          </div>
        );
      }}
    </FormConsumer>
  );
};

export default RenderMultiSelect;

import React from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Select } from "antd";
import { caseInsensitiveLabelFilter } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";

/**
 * @constant RenderSelect - Ant Design `Select` component for redux-form - used for small data sets that (< 100);
 */
const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  meta: CustomPropTypes.formMeta,
  data: CustomPropTypes.options,
  filterOption: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  disabled: PropTypes.bool,
  onSearch: PropTypes.func,
};

const defaultProps = {
  placeholder: "",
  label: "",
  data: [],
  disabled: false,
  meta: {},
  onSearch: () => {},
  filterOption: false,
};

export const RenderMultiSelect = (props) => (
  <div>
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
    >
      <Select
        virtual={false}
        disabled={!props.data || props.disabled}
        mode="multiple"
        size="small"
        getPopupContainer={(trigger) => trigger.parentNode}
        placeholder={props.placeholder}
        id={props.id}
        onSearch={props.onSearch}
        value={props.input.value ? props.input.value : undefined}
        onChange={props.input.onChange}
        filterOption={props.filterOption || caseInsensitiveLabelFilter}
        showArrow
      >
        {props.data &&
          props.data.map(({ value, label, tooltip }) => (
            <Select.Option key={value} value={value} title={tooltip}>
              {label}
            </Select.Option>
          ))}
      </Select>
    </Form.Item>
  </div>
);

RenderMultiSelect.propTypes = propTypes;
RenderMultiSelect.defaultProps = defaultProps;

export default RenderMultiSelect;

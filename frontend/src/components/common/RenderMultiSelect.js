import React from "react";
import PropTypes from "prop-types";
import { Form, Select } from "antd";
import CustomPropTypes from "@/customPropTypes";

/**
 * @constant RenderSelect - Ant Design `Select` component for redux-form - used for small data sets that (< 100);
 */
const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.any,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  meta: PropTypes.object,
  data: CustomPropTypes.options,
  disabled: PropTypes.bool,
};

const defaultProps = {
  placeholder: "",
  label: "",
  data: [],
  disabled: false,
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
        disabled={!props.data || props.disabled}
        mode="multiple"
        getPopupContainer={() => document.getElementById(props.id)}
        placeholder={props.placeholder}
        id={props.id}
        {...props.input}
      >
        {props.data &&
          props.data.map(({ value, label }) => <Select.Option key={value}>{label}</Select.Option>)}
      </Select>
    </Form.Item>
  </div>
);

RenderMultiSelect.propTypes = propTypes;
RenderMultiSelect.defaultProps = defaultProps;

export default RenderMultiSelect;

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
  meta: CustomPropTypes.formMeta,
  data: CustomPropTypes.options,
  disabled: PropTypes.bool,
  onSelect: PropTypes.func,
};

const defaultProps = {
  placeholder: "",
  label: "",
  data: [],
  disabled: false,
  meta: {},
  onSelect: ()=> {}
};

const RenderSelect = (props) => (
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
      disabled={props.disabled}
      getPopupContainer={() => document.getElementById(props.id)}
      showSearch
      placeholder={props.placeholder}
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      id={props.id}
      {...props.input}
      onSelect={props.onSelect}
    >
      {props.data.map((opt) => (
        <Select.Option
          disabled={props.usedOptions && props.usedOptions.includes(opt.value)}
          key={opt.value}
          value={opt.value}
        >
          {opt.label}
        </Select.Option>
      ))}
    </Select>
  </Form.Item>
);

RenderSelect.propTypes = propTypes;
RenderSelect.defaultProps = defaultProps;

export default RenderSelect;

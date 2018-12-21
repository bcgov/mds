import React from "react";
import PropTypes from "prop-types";
import { Form, Select } from "antd";

/**
 * @constant RenderSelect - Ant Design `Select` component for redux-form - used for small data sets that (< 100);
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  input: PropTypes.any,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  opton: PropTypes.object,
  meta: PropTypes.object,
  data: PropTypes.array,
  disabled: PropTypes.bool,
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
    >
      {props.data.map((value) => (
        <Select.Option key={value.value} value={value.value}>
          {value.label}
        </Select.Option>
      ))}
    </Select>
  </Form.Item>
);

RenderSelect.propTypes = propTypes;

export default RenderSelect;

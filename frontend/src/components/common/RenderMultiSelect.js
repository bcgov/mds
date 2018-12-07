import React from "react";
import PropTypes from "prop-types";
import { Form, Select } from "antd";

/**
 * @constant RenderSelect - Ant Design `Select` component for redux-form - used for small data sets that (< 100);
 */

// const children = [];
// for (let i = 10; i < 36; i++) {
//   children.push(<Select.Option key={i.toString(36) + i}>{i.toString(36) + i}</Select.Option>);
// }
const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  input: PropTypes.any,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  opton: PropTypes.object,
  meta: PropTypes.object,
  data: PropTypes.array,
};

const RenderMultiSelect = (props) => (
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
      mode="multiple"
      getPopupContainer={() => document.getElementById(props.id)}
      placeholder={props.placeholder}
      id={props.id}
      {...props.input}
    >
      {props.data.map((value) => (
        <Select.Option disabled={value.value === "SC"} key={value.value}>
          {value.label}
        </Select.Option>
      ))}
    </Select>
  </Form.Item>
);

RenderMultiSelect.propTypes = propTypes;

export default RenderMultiSelect;

import React from "react";
import PropTypes from "prop-types";
import { Form, Select } from "antd";

/**
 * @constant RenderSelect - Ant Design `Select` component for redux-form - used for small data sets that (< 100);
 */

const children = [];
for (let i = 10; i < 36; i++) {
  children.push(<Select.Option key={i.toString(36) + i}>{i.toString(36) + i}</Select.Option>);
}
const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  input: PropTypes.any,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  opton: PropTypes.object,
  meta: PropTypes.object,
  data: PropTypes.array,
};
const RenderSelect = ({
  id,
  input,
  label,
  placeholder,
  meta: { touched, error, warning },
  data,
}) => (
  <Form.Item
    label={label}
    validateStatus={touched ? (error && "error") || (warning && "warning") : ""}
    help={touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
  >
    <Select
      mode="multiple"
      getPopupContainer={() => document.getElementById(id)}
      placeholder={placeholder}
      id={id}
      {...input}
    >
      {children}
      {data.map((value) =>
        children.push(
          <Select.Option key={value.value} value={value.value}>
            {value.label}
          </Select.Option>
        )
      )}
    </Select>
  </Form.Item>
);

RenderSelect.propTypes = propTypes;

export default RenderSelect;

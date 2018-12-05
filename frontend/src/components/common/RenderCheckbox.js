import React from "react";
import PropTypes from "prop-types";
import { Form, Checkbox } from "antd";

/**
 * @constant RenderCheckbox - Ant Design `Checkbox` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  meta: PropTypes.object,
};

const RenderCheckbox = ({ id, input, label, meta: { touched, error } }) => (
  <Form.Item validateStatus={touched ? error && "error" : ""}>
    <Checkbox id={id} checked={input.value} {...input}>
      {label}
    </Checkbox>
  </Form.Item>
);

RenderCheckbox.propTypes = propTypes;

export default RenderCheckbox;

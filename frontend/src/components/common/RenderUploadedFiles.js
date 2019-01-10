import React from "react";
import PropTypes from "prop-types";
import { Form, Input } from "antd";

/**
 * @constant RenderUploadedFiles
 */

const propTypes = {
  input: PropTypes.any,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  meta: PropTypes.object,
};

const RenderUploadedFiles = ({ input, label, placeholder, meta: { touched, error, warning } }) => (
  <Form.Item
    label={label}
    validateStatus={touched ? (error && "error") || (warning && "warning") : ""}
    help={touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
  >
    <Input id={id} placeholder={placeholder} {...input} />
  </Form.Item>
);

RenderField.propTypes = propTypes;

export default RenderField;

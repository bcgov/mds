import React from "react";
import PropTypes from "prop-types";
import { Form, Input } from "antd";

/**
 * @constant RenderField - Ant Design `Input` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  input: PropTypes.any,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  meta: PropTypes.object,
  inlineLabel: PropTypes.string,
};

const RenderField = ({
  id,
  input,
  label,
  placeholder,
  defaultValue,
  meta: { touched, error, warning },
  inlineLabel,
}) => (
  <Form.Item
    label={label}
    validateStatus={touched ? (error && "error") || (warning && "warning") : ""}
    help={touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
  >
    <div className="flex">
      {inlineLabel && (
        <label className="nowrap" style={{ paddingRight: "10px", fontSize: "20px" }}>
          {inlineLabel}
        </label>
      )}
      <Input defaultValue={defaultValue} id={id} placeholder={placeholder} {...input} />
    </div>
  </Form.Item>
);

RenderField.propTypes = propTypes;

export default RenderField;

import React from "react";
import PropTypes from "prop-types";
import { Form, Input } from "antd";

/**
 * @constant RenderField - Ant Design `Input` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  inlineLabel: PropTypes.string,
  disabled: PropTypes.bool,
  defaultValue: PropTypes.string,
  allowClear: PropTypes.bool,
};

const defaultProps = {
  label: "",
  placeholder: "",
  inlineLabel: "",
  disabled: false,
  defaultValue: "",
  allowClear: false,
};

const RenderField = (props) => {
  return (
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
      <div className="inline-flex">
        {props.inlineLabel && (
          <label
            htmlFor={props.id}
            className="nowrap"
            style={{ paddingRight: "10px", fontSize: "20px" }}
          >
            {props.inlineLabel}
          </label>
        )}
        <Input
          disabled={props.disabled}
          defaultValue={props.defaultValue}
          id={props.id}
          placeholder={props.placeholder}
          allowClear={props.allowClear}
          {...props.input}
        />
      </div>
    </Form.Item>
  );
};
RenderField.propTypes = propTypes;
RenderField.defaultProps = defaultProps;

export default RenderField;

import React from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Input } from "antd";

/**
 * @constant  RenderAutoSizeField - Ant Design `Input` autosize component for redux-form. (useful for notes/description)
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  disabled: PropTypes.bool,
  minRows: PropTypes.number,
};

const defaultProps = {
  placeholder: "",
  label: "",
  disabled: false,
  minRows: 4,
};

const RenderAutoSizeField = (props) => (
  <Form.Item
    label={props.label}
    placeholder={props.placeholder}
    validateStatus={
      props.meta.touched ? (props.meta.error && "error") || (props.meta.warning && "warning") : ""
    }
    help={
      props.meta.touched &&
      ((props.meta.error && <span>{props.meta.error}</span>) ||
        (props.meta.warning && <span>{props.meta.warning}</span>))
    }
  >
    <Input.TextArea
      disabled={props.disabled}
      id={props.id}
      {...props.input}
      autoSize={{ minRows: props.minRows }}
      placeholder={props.placeholder}
    />
  </Form.Item>
);

RenderAutoSizeField.propTypes = propTypes;
RenderAutoSizeField.defaultProps = defaultProps;

export default RenderAutoSizeField;

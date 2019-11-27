import React from "react";
import PropTypes from "prop-types";
import { Form, Input } from "antd";

/**
 * @constant  RenderScrollField - Ant Design `TextArea` component for redux-form. (useful for notes/description)
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  rows: PropTypes.number,
};

const defaultProps = {
  placeholder: "",
  label: "",
  rows: 5,
};

const { TextArea } = Input;
const RenderScrollField = (props) => (
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
    <TextArea id={props.id} {...props.input} rows={props.rows} placeholder={props.placeholder} />
  </Form.Item>
);

RenderScrollField.propTypes = propTypes;
RenderScrollField.defaultProps = defaultProps;

export default RenderScrollField;

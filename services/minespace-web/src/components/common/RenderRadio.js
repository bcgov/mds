import React from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Radio } from "antd";

/**
 * @constant RenderCheckbox - Ant Design `Checkbox` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  input: PropTypes.objectOf(PropTypes.string).isRequired,
  disabled: PropTypes.bool.isRequired,
};

const RenderCheckbox = (props) => {
  console.log(props.input);
  // change;
  return (
    <Form.Item validateStatus={props.meta.touched ? props.meta.error && "error" : ""}>
      <Radio
        id={props.id}
        checked={props.value === props.input.value}
        {...props.input}
        disabled={props.disabled}
        defaultValue={props.value}
      >
        {props.label}
      </Radio>
    </Form.Item>
  );
};

RenderCheckbox.propTypes = propTypes;

export default RenderCheckbox;

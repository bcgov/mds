import React, { useState } from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Checkbox } from "antd";

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
  const [checked, setChecked] = useState(false);
  const onChange = (e) => {
    setChecked(e.target.checked);
  };

  return (
    <Form.Item validateStatus={props.meta.touched ? props.meta.error && "error" : ""}>
      <Checkbox
        id={props.id}
        {...props.input}
        disabled={props.disabled}
        checked={checked}
        onChange={onChange}
      >
        {props.label}
      </Checkbox>
    </Form.Item>
  );
};

RenderCheckbox.propTypes = propTypes;

export default RenderCheckbox;

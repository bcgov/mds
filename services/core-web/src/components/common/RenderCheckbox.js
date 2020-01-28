import React from "react";
import PropTypes from "prop-types";
import { Form, Checkbox } from "antd";

/**
 * @constant RenderCheckbox - Ant Design `Checkbox` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
};

const RenderCheckbox = (props) => (
  <Form.Item validateStatus={props.meta.touched ? props.meta.error && "error" : ""}>
    <Checkbox id={props.id} checked={props.input.value} {...props.input}>
      {props.label}
    </Checkbox>
  </Form.Item>
);

RenderCheckbox.propTypes = propTypes;

export default RenderCheckbox;

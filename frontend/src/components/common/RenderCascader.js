import React from "react";
import PropTypes from "prop-types";
import { Form, Cascader } from "antd";

/**
 * @constant RenderCascader - Ant Design `Cascader` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  placeholder: PropTypes.string.isRequired,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  options: PropTypes.array.isRequired.isRequired,
  label: PropTypes.string,
  changeOnSelect: PropTypes.bool,
};

const defaultProps = {
  changeOnSelect: false,
  label: "",
};

const RenderCascader = (props) => (
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
    <Cascader
      expandTrigger="hover"
      id={props.id}
      placeholder={props.placeholder}
      options={props.options}
      {...props.input}
      changeOnSelect={props.changeOnSelect}
    />
  </Form.Item>
);

RenderCascader.propTypes = propTypes;
RenderCascader.defaultProps = defaultProps;

export default RenderCascader;

import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Form, DatePicker } from "antd";

/**
 * @constant RenderDateTime  - Ant Design `DatePicker` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  time: PropTypes.boolean,
};

const defaultProps = {
  time: false,
};

const RenderDateTime = (props) => (
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
    <DatePicker
      id={props.id}
      {...props.input}
      placeholder={props.placeholder}
      onChange={(date, dateString) => props.input.onChange(dateString)}
      value={props.input.value ? moment(props.input.value) : null}
      showTime={{ format: "HH:mm" }}
      format="YYYY-MM-DD HH:mm"
      style={{ width: "100%" }}
    />
  </Form.Item>
);

RenderDateTime.propTypes = propTypes;
RenderDateTime.defaultProps = defaultProps;

export default RenderDateTime;

import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Form, DatePicker } from "antd";

/**
 * @constant RenderDate  - Ant Design `DatePicker` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  showTime: PropTypes.bool,
};

const defaultProps = {
  showTime: false,
  placeholder: "yyyy-mm-dd",
  onChange: () => {},
};

const RenderDate = (props) => (
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
      showTime={props.showTime && { format: "HH:mm" }}
      format={props.showTime && "YYYY-MM-DD HH:mm"}
      style={props.showTime && { width: "100%" }}
    />
  </Form.Item>
);

RenderDate.propTypes = propTypes;
RenderDate.defaultProps = defaultProps;

export default RenderDate;

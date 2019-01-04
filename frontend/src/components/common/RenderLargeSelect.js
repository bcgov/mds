import React from "react";
import PropTypes from "prop-types";
import { Form, AutoComplete, Input } from "antd";

/**
 * @constant RenderLargeSelect - Ant Design `AutoComplete` component for redux-form -- being used instead of 'RenderSelect' for large data sets that require a limit.
 */

const propTypes = {
  input: PropTypes.shape({ value: PropTypes.string }).isRequired,
  options: PropTypes.objectOf(PropTypes.any).isRequired,
  data: PropTypes.arrayOf(PropTypes.string).isRequired,
  label: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

const defaultProps = {
  label: "",
  placeholder: "",
};

const transformData = (data, option) =>
  data.map((opt) => (
    <AutoComplete.Option key={opt} value={opt}>
      {option[opt].name}
    </AutoComplete.Option>
  ));

const RenderLargeSelect = (props) => (
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
    <AutoComplete
      getPopupContainer={() => document.getElementById(props.id)}
      id={props.id}
      defaultActiveFirstOption
      notFoundContent="Not Found"
      dropdownMatchSelectWidth
      backfill
      style={{ width: "100%" }}
      dataSource={props.input.value.length > 0 ? transformData(props.data, props.options) : []}
      placeholder={props.placeholder}
      filterOption={(input, option) =>
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      onSearch={props.handleChange}
      {...props.input}
    >
      <Input />
    </AutoComplete>
  </Form.Item>
);

RenderLargeSelect.propTypes = propTypes;
RenderLargeSelect.defaultProps = defaultProps;

export default RenderLargeSelect;

import React from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Select } from "antd";

/**
 * @constant RenderLargeSelect - Ant Design `AutoComplete` component for redux-form -- being used instead of 'RenderSelect' for large data sets that require a limit.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  dataSource: PropTypes.arrayOf(PropTypes.any).isRequired,
  selectedOption: PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.label,
    value: PropTypes.string,
  }).isRequired,
  input: PropTypes.shape({ value: PropTypes.string, onChange: PropTypes.func }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
    warning: PropTypes.string,
  }).isRequired,
  handleSearch: PropTypes.func,
  handleSelect: PropTypes.func,
};

const doNothing = () => {};
const defaultProps = {
  label: "",
  placeholder: "",
  handleSelect: doNothing,
  handleSearch: doNothing,
};

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
    <Select
      showSearch
      id={props.id}
      defaultActiveFirstOption={false}
      notFoundContent="Not Found"
      dropdownMatchSelectWidth
      backfill
      style={{ width: "100%" }}
      options={props.dataSource}
      placeholder={props.placeholder}
      filterOption={() => true}
      onSearch={props.handleSearch}
      onSelect={props.handleSelect}
      onChange={props.input.onChange}
      onBlur={props.input.onChange(props.selectedOption.value)}
    />
  </Form.Item>
);

RenderLargeSelect.propTypes = propTypes;
RenderLargeSelect.defaultProps = defaultProps;

export default RenderLargeSelect;

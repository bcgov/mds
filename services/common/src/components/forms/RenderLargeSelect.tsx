import React from "react";
import PropTypes from "prop-types";
import { Select, Form } from "antd";

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
    label: PropTypes.string, // was PropTypes.label
    value: PropTypes.string,
  }).isRequired,
  input: PropTypes.shape({
    value: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
    warning: PropTypes.string,
  }).isRequired,
  handleSearch: PropTypes.func,
  handleSelect: PropTypes.func,
  handleFocus: PropTypes.func,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
};

const doNothing = () => {};
const defaultProps = {
  label: "",
  placeholder: "",
  handleSelect: doNothing,
  handleSearch: doNothing,
  handleFocus: doNothing,
  disabled: false,
};

const RenderLargeSelect = (props) => (
  <Form.Item
    required={props.required}
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
      loading={props.loading}
      virtual={false}
      disabled={props.disabled}
      id={props.id}
      dropdownMatchSelectWidth
      showSearch
      style={{ width: "100%" }}
      defaultActiveFirstOption={false}
      placeholder={props.placeholder}
      notFoundContent="Not Found"
      options={props.dataSource}
      filterOption={() => true}
      onSearch={props.handleSearch}
      onSelect={props.handleSelect}
      onChange={props.input.onChange}
      onFocus={(event) => {
        props.handleFocus();
        props.input.onFocus(event);
      }}
    />
  </Form.Item>
);

RenderLargeSelect.propTypes = propTypes;
RenderLargeSelect.defaultProps = defaultProps;

export default RenderLargeSelect;

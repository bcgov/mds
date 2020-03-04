import React from "react";
import PropTypes from "prop-types";
import { Form, AutoComplete } from "antd";
import * as Styles from "@/constants/styles";

/**
 * @constant RenderAutoComplete - Ant Design `AutoComplete` component for redux-form.
 *
 */

const propTypes = {
  handleChange: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.any).isRequired,
  id: PropTypes.string,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.string,
  label: PropTypes.string,
  iconColor: PropTypes.string,
  disabled: PropTypes.bool,
  meta: PropTypes.objectOf(PropTypes.any),
  input: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  id: "search",
  placeholder: "",
  defaultValue: "",
  label: "",
  iconColor: Styles.COLOR.violet,
  disabled: false,
  meta: {},
  input: null,
};

const RenderAutoComplete = (props) => {
  return (
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
        defaultActiveFirstOption={false}
        notFoundContent="Not Found"
        allowClear
        dropdownMatchSelectWidth
        defaultValue={props.defaultValue}
        style={{ width: "100%" }}
        dataSource={props.data}
        placeholder={props.placeholder}
        filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        disabled={props.disabled}
        {...props.input}
        onSelect={props.handleSelect}
        onChange={(event) => {
          props.handleChange(event);
          if (props.input) {
            props.input.onChange(event);
          }
        }}
      />
    </Form.Item>
  );
};

RenderAutoComplete.propTypes = propTypes;
RenderAutoComplete.defaultProps = defaultProps;

export default RenderAutoComplete;

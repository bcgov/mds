import React from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Select } from "antd";
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
      label={JSON.stringify(props.selected)}
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
        defaultActiveFirstOption={false}
        notFoundContent="Not Found"
        allowClear
        dropdownMatchSelectWidth
        defaultValue={props.input ? props.input.value : undefined}
        value={props.input ? props.input.value : undefined}
        style={{ width: "100%" }}
        options={props.data}
        placeholder={props.placeholder}
        filterOption={(input, option) =>
          option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        disabled={props.disabled}
        // {...props.input}
        onChange={props.input ? props.input.onChange : undefined}
        onSelect={props.handleSelect}
        onSearch={(event) => {
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

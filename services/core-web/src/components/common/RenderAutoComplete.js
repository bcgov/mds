import React from "react";
import PropTypes from "prop-types";
import { Form, Icon, Input, AutoComplete } from "antd";
import * as Styles from "@/constants/styles";

/**
 * @constant RenderAutoComplete - Ant Design `AutoComplete` component for redux-form.
 *
 */

const propTypes = {
  id: PropTypes.string,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.any).isRequired,
  placeholder: PropTypes.string,
  iconColor: PropTypes.string,
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool,
};

const defaultProps = {
  id: "search",
  placeholder: "",
  defaultValue: "",
  iconColor: Styles.COLOR.violet,
  disabled: false,
};

const RenderAutoComplete = (props) => {
  console.log(props);
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
        backfill
        defaultValue={props.defaultValue}
        style={{ width: "100%" }}
        dataSource={props.data}
        placeholder={props.placeholder}
        filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        // disabled={props.disabled}
        {...props.input}
        // onSelect={props.handleSelect}
        onChange={(event) => {
          //console.log(evet);
          props.handleChange(event);
          props.input.onChange(event);
        }}
      />
    </Form.Item>
  );
};

RenderAutoComplete.propTypes = propTypes;
RenderAutoComplete.defaultProps = defaultProps;

export default RenderAutoComplete;

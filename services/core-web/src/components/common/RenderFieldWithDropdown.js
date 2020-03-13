import React from "react";
import PropTypes from "prop-types";
import { Form, Input, Select } from "antd";

/**
 * @constant RenderFieldWithDropdown - Ant Design `Input` component for redux-form that also has a small dropdown attached for inputs like units.
 */

const { Option } = Select;

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  inlineLabel: PropTypes.string,
  disabled: PropTypes.bool,
  defaultValue: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)),
  dropdownID: PropTypes.string,
};

const defaultProps = {
  label: "",
  placeholder: "",
  inlineLabel: "",
  disabled: false,
  defaultValue: "",
  data: [],
  dropdownID: "",
};

const selectAfter = (data, id, isDisabled, input) => {
  return (
    <Select style={{ width: 80 }} disabled={isDisabled} {...input} id={id}>
      {data.map((d) => (
        <Option value={d.value} key={d.value}>
          {d.label}
        </Option>
      ))}
    </Select>
  );
};

const RenderFieldWithDropdown = (props) => {
  return (
    <Form.Item
      label={props.label}
      validateStatus={
        props[props.id].meta.touched
          ? (props[props.id].meta.error && "error") || (props[props.id].meta.warning && "warning")
          : ""
      }
      help={
        props[props.id].meta.touched &&
        ((props[props.id].meta.error && <span>{props[props.id].meta.error}</span>) ||
          (props[props.id].meta.warning && <span>{props[props.id].meta.warning}</span>))
      }
    >
      <div className="inline-flex">
        {props.inlineLabel && (
          <label
            htmlFor={props.id}
            className="nowrap"
            style={{ paddingRight: "10px", fontSize: "20px" }}
          >
            {props.inlineLabel}
          </label>
        )}
        <Input
          disabled={props.disabled}
          defaultValue={props.defaultValue}
          id={props.id}
          placeholder={props.placeholder}
          {...props[props.id].input}
          addonAfter={selectAfter(
            props.data,
            props.dropdownID,
            props.disabled,
            props[props.dropdownID].input
          )}
        />
      </div>
    </Form.Item>
  );
};

RenderFieldWithDropdown.propTypes = propTypes;
RenderFieldWithDropdown.defaultProps = defaultProps;

export default RenderFieldWithDropdown;

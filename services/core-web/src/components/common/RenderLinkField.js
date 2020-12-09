import React from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Input, Select } from "antd";

/**
 * @constant RenderLinkField - Ant Design `Input` component for redux-form with a default addon for "http://" or "https://".
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  inlineLabel: PropTypes.string,
  disabled: PropTypes.bool,
  defaultValue: PropTypes.string,
  allowClear: PropTypes.bool,
};

const defaultProps = {
  label: "",
  placeholder: "",
  inlineLabel: "",
  disabled: false,
  defaultValue: "",
  allowClear: false,
};

const selectBefore = (
  <Select defaultValue="http://" className="select-before">
    <Select.Option value="http://">http://</Select.Option>
    <Select.Option value="https://">https://</Select.Option>
  </Select>
);

const RenderLinkField = (props) => {
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
          addonBefore={selectBefore}
          disabled={props.disabled}
          defaultValue={props.defaultValue}
          id={props.id}
          placeholder={props.placeholder}
          allowClear={props.allowClear}
          {...props.input}
        />
      </div>
    </Form.Item>
  );
};
RenderLinkField.propTypes = propTypes;
RenderLinkField.defaultProps = defaultProps;

export default RenderLinkField;

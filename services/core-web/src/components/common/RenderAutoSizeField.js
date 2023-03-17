import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Input } from "antd";

/**
 * @constant  RenderAutoSizeField - Ant Design `Input` autosize component for redux-form. (useful for notes/description)
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  disabled: PropTypes.bool,
  minRows: PropTypes.number,
  maximumCharacters: PropTypes.number,
};

const defaultProps = {
  placeholder: "",
  label: "",
  disabled: false,
  minRows: 3,
  maximumCharacters: 0,
};

const RenderAutoSizeField = (props) => {
  const [remainingChars, setRemainingChars] = useState(props.maximumCharacters);
  const [value, setValue] = useState(props.input?.value ?? "");

  const handleTextAreaChange = (event) => {
    setValue(event.target.value);
    if (props.maximumCharacters > 0) {
      const input = event.target.value;
      const remaining = props.maximumCharacters - input.length;
      setRemainingChars(remaining);
    }
  };

  useEffect(() => {
    if (props.input) {
      const input = props.input.value;
      const remaining = props.maximumCharacters - input.length;
      setRemainingChars(remaining);
    }
  }, []);

  return (
    <Form.Item
      label={props.label}
      placeholder={props.placeholder}
      validateStatus={
        props.meta.touched ? (props.meta.error && "error") || (props.meta.warning && "warning") : ""
      }
      help={
        props.meta.touched &&
        ((props.meta.error && <span>{props.meta.error}</span>) ||
          (props.meta.warning && <span>{props.meta.warning}</span>))
      }
    >
      <Input.TextArea
        disabled={props.disabled}
        id={props.id}
        {...props.input}
        autoSize={{ minRows: props.minRows }}
        placeholder={props.placeholder}
        onChange={handleTextAreaChange}
        value={value}
      />
      {props.maximumCharacters > 0 && (
        <div className="flex between">
          <span>{`Maximum ${props.maximumCharacters} characters`}</span>
          <span className="flex-end">{`${remainingChars} / ${props.maximumCharacters}`}</span>
        </div>
      )}
    </Form.Item>
  );
};

RenderAutoSizeField.propTypes = propTypes;
RenderAutoSizeField.defaultProps = defaultProps;

export default RenderAutoSizeField;

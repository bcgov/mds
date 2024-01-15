import React, { useState, useEffect, FC } from "react";
import { Input, Form, Row } from "antd";
import { BaseInputProps, BaseViewInput, getFormItemLabel } from "./BaseInput";
import { FormConsumer, IFormContext } from "./FormWrapper";

/**
 * @constant  RenderAutoSizeField - Ant Design `Input` autosize component for redux-form. (useful for notes/description)
 */

interface AutoSizeProps extends BaseInputProps {
  minRows?: number;
  maximumCharacters?: number;
}

const RenderAutoSizeField: FC<AutoSizeProps> = ({
  label = "",
  disabled = false,
  maximumCharacters = 0,
  minRows = 3,
  required = false,
  ...props
}) => {
  const [remainingChars, setRemainingChars] = useState(maximumCharacters);
  const [inputValue, setValue] = useState(props.input.value ?? "");

  const handleTextAreaChange = (event) => {
    setValue(event.target.value);
    if (maximumCharacters > 0) {
      const input = event.target.value;
      const remaining = maximumCharacters - input.length;
      setRemainingChars(remaining);
    }
  };

  useEffect(() => {
    const input = props.input.value;
    const remaining = maximumCharacters - input.length;
    setRemainingChars(remaining);
  }, []);

  return (
    <FormConsumer>
      {(value: IFormContext) => {
        if (!value.isEditMode) {
          return <BaseViewInput value={props.input.value} label={label} />;
        }
        return (
          <Form.Item
            name={props.input.name}
            required={required}
            label={getFormItemLabel(label, required)}
            validateStatus={
              props.meta.touched
                ? (props.meta.error && "error") || (props.meta.warning && "warning")
                : ""
            }
            help={
              props.meta.touched &&
              ((props.meta.error && <span>{props.meta.error}</span>) ||
                (props.meta.warning && <span>{props.meta.warning}</span>))
            }
          >
            <>
              <Input.TextArea
                disabled={disabled}
                id={props.id}
                {...props.input}
                autoSize={{ minRows: minRows }}
                placeholder={props.placeholder}
                onChange={handleTextAreaChange}
                value={inputValue}
              />
              {maximumCharacters > 0 && (
                <Row justify="space-between">
                  <span>{`Maximum ${maximumCharacters} characters`}</span>
                  <span className="flex-end">{`${remainingChars} / ${maximumCharacters}`}</span>
                </Row>
              )}
            </>
          </Form.Item>
        );
      }}
    </FormConsumer>
  );
};
export default RenderAutoSizeField;

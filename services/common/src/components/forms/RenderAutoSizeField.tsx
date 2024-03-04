import React, { FC } from "react";
import { Input, Form, Row } from "antd";
import { BaseInputProps, BaseViewInput, getFormItemLabel } from "./BaseInput";
import { FormConsumer, IFormContext } from "./FormWrapper";

/**
 * @constant  RenderAutoSizeField - Ant Design `Input` autosize component for redux-form. (useful for notes/description)
 */

interface AutoSizeProps extends BaseInputProps {
  minRows?: number;
  maximumCharacters: number;
}

const RenderAutoSizeField: FC<AutoSizeProps> = ({
  label = "",
  labelSubtitle,
  help,
  disabled = false,
  maximumCharacters,
  minRows = 3,
  required = false,
  ...props
}) => {
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
            label={getFormItemLabel(label, required, labelSubtitle)}
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
              />
              <Row
                justify="space-between"
                className={`form-item-help ${props.input.name}-form-help`}
              >
                {help ? (
                  <span>{help}</span>
                ) : (
                  <span>{`Maximum ${maximumCharacters} characters`}</span>
                )}
                <span className="flex-end">{`${maximumCharacters -
                  props.input.value.length} / ${maximumCharacters}`}</span>
              </Row>
            </>
          </Form.Item>
        );
      }}
    </FormConsumer>
  );
};
export default RenderAutoSizeField;

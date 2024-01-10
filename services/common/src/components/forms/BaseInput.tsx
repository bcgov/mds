import { Typography } from "antd";
import React, { FC } from "react";
import { WrappedFieldProps, WrappedFieldMetaProps, WrappedFieldInputProps } from "redux-form";

/**
 BaseInput:
 A complementary component used together with FormWrapper and inputs such as RenderField
 And some helpful interfaces/functions.

  BaseInputProps:
  - extends the type that reduxForm Field expects in TS files
  - additionally some attributes that we want on all or most of our inputs (such as label)
  - It can be used directly or extended further by input components

  BaseViewInput:
  - a component for consistent rendering between components in view mode
  - usable in all or most cases

  getFormItemLabel(label, isRequired):
  - helper function for consistent label rendering
  - will add on `(optional)` to optional fields

  EXAMPLE IMPLEMENTATION:

  interface MyInputProps extends BaseInputProps {
    someAttribute: string;
  }

  // any props defined in BaseInputProps will be available in your component
  // reduxForm will pass input and meta
  export const RenderMyInput: FC<MyInputProps> = ({input, meta, label, required, ...props}) => {
    return (
      // FormConsumer will give access to attributes given to FormWrapper
      <FormConsumer>
        {(value: IFormContext) => {
          if (!value.isEditMode) {

            // optionally do any formatting or processing of the input value
            let displayValue = formatMyValueForDisplay(input.value);
            return <BaseViewInput value={displayValue} label={label} />;
          }
          return (
            // The following attributes (name, label, required, validateStatus, help)
            // can and should be copied and pasted into most implementations
            <Form.Item
              name={input.name} // the name attribute is needed for the value to be passed to onSubmit
              label={getFormItemLabel(label, required)}
              required={required} // for showing the * mark. Not validation
              validateStatus={
                meta.touched ? (meta.error && "error") || (meta.warning && "warning") : ""
              }
              help={
                meta.touched &&
                ((meta.error && <span>{meta.error}</span>) ||
                  (meta.warning && <span>{meta.warning}</span>))
              }
            >
              <input value={input.value}/>
            </Form.Item>
          );
        }}
      </FormConsumer>
    );
  }

*/

export interface BaseInputProps extends WrappedFieldProps {
  meta: WrappedFieldMetaProps;
  input: WrappedFieldInputProps;
  label?: string;
  id: string;
  defaultValue?: any;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  allowClear?: boolean;
}

interface BaseViewInputProps {
  label?: string;
  value: string | number;
}
export const BaseViewInput: FC<BaseViewInputProps> = ({ label = "", value = "" }) => {
  return (
    <div className="view-item">
      {label.length && (
        <Typography.Paragraph className="view-item-label">{label}</Typography.Paragraph>
      )}
      <Typography.Paragraph className="view-item-value">{value.toString()}</Typography.Paragraph>
    </div>
  );
};

// for consistent formatting of optional field indicator
export const getFormItemLabel = (label: string, isRequired: boolean) => {
  if (!label) {
    return "";
  }
  if (isRequired) {
    return label;
  }
  return (
    <>
      {label} <span className="form-item-optional">&nbsp;(optional)</span>
    </>
  );
};

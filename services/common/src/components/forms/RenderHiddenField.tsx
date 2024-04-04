import React, { FC, useState, useEffect } from "react";
import { Input, Form } from "antd";
import { BaseInputProps, getFormItemLabel } from "./BaseInput";

/**
 * Just can't conform the UI to play nice with redux-form?
 * This will display the label and handle validation on change and submit
 * Can handle string, number, string[] values, can probably use normalize on Field to coerce

    USAGE
    - the main thing to note is that you should be handling the redux change to update the value
    - making the "actual" input the children will put help/validation messages at the bottom
    - if this is not desired, put underneath <Field /> instead, 
    - but there is a min-height on form-item that will have to be dealt with...

    <Field
        name="field_name"
        component={RenderHiddenField}
        required
        validate={[required]}
        label="Label"
    >
        <Checkbox
            value
            checked
            onChange={(e) => dispatch(change(FORM_NAME, "field_name", ["5"]))}
        >
            Checkbox label
        </Checkbox>
        {whatever else is necessary to display}
    </Field>
 */
const RenderHiddenField: FC<BaseInputProps> = ({
  label,
  labelSubtitle,
  help,
  meta,
  input,
  disabled,
  required,
  defaultValue,
  children,
}) => {
  const [touched, setTouched] = useState(meta.touched);

  useEffect(() => {
    // dirty catches when the value is set & cleared,
    // touched should catch when it's submitted
    if (meta.dirty || meta.touched) {
      setTouched(true);
    }
  }, [meta.dirty, meta.touched]);

  return (
    <Form.Item
      className="form-item-hidden"
      name={input.name}
      required={required}
      label={getFormItemLabel(label, required, labelSubtitle)}
      validateStatus={touched ? (meta.error && "error") || (meta.warning && "warning") : ""}
      help={
        touched &&
        ((meta.error && <span>{meta.error}</span>) || (meta.warning && <span>{meta.warning}</span>))
      }
    >
      <>
        <div style={{ display: "none" }}>
          <Input
            disabled={disabled}
            defaultValue={defaultValue}
            name={input.name}
            value={input.value}
          />
        </div>
        {children}
        {help && <div className={`form-item-help ${input.name}-form-help`}>{help}</div>}
      </>
    </Form.Item>
  );
};

export default RenderHiddenField;

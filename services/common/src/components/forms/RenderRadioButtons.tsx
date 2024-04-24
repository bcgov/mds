import React, { FC, useContext } from "react";
import { Form, Radio } from "antd";
import { BaseInputProps, getFormItemLabel } from "@mds/common/components/forms/BaseInput";
import { IOption } from "@mds/common/interfaces";
import { FormContext } from "./FormWrapper";

/**
 * @class RenderRadioButtons - Ant Design `Radio` component used for boolean values in redux-form.
 */

interface RenderRadioButtonsProps extends BaseInputProps {
  label: string;
  customOptions?: IOption[];
  optionType?: "default" | "button";
  isVertical?: boolean;
}

const RenderRadioButtons: FC<RenderRadioButtonsProps> = ({
  meta,
  label,
  disabled = false,
  input,
  id,
  help,
  customOptions,
  required = false,
  optionType = "default",
  isVertical = false,
}) => {
  const { isEditMode } = useContext(FormContext);

  const options = customOptions ?? [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];

  const handleRadioChange = (e) => {
    input.onChange(e.target.value);
  };

  return (
    <Form.Item
      id={id}
      getValueProps={() => ({ value: input.value })}
      name={input.name}
      required={required}
      validateStatus={meta.touched ? (meta.error && "error") || (meta.warning && "warning") : ""}
      help={
        meta.touched &&
        ((meta.error && <span>{meta.error}</span>) || (meta.warning && <span>{meta.warning}</span>))
      }
      label={getFormItemLabel(label, required)}
    >
      <>
        <Radio.Group
          disabled={disabled || !isEditMode}
          name={input.name}
          value={input.value}
          onChange={handleRadioChange}
          options={options}
          optionType={optionType}
          buttonStyle="solid"
          {...(isVertical && { className: "vertical-radio-group" })}
        />
        {help && <div className={`form-item-help ${input.name}-form-help`}>{help}</div>}
      </>
    </Form.Item>
  );
};

export default RenderRadioButtons;

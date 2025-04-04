import React, { FC, useContext } from "react";
import { Form, Radio } from "antd";
import { BaseInputProps, BaseViewInput, getFormItemLabel } from "@mds/common/components/forms/BaseInput";
import { IRadioOption } from "@mds/common/interfaces";
import { FormContext } from "./FormWrapper";

/**
 * @class RenderRadioButtons - Ant Design `Radio` component used for boolean values in redux-form.
 */

interface RenderRadioButtonsProps extends BaseInputProps {
  label: string;
  customOptions?: IRadioOption[];
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
  labelSubtitle,
  required = false,
  optionType = "default",
  isVertical = false,
  showOptional = true,
}) => {
  const { isEditMode } = useContext(FormContext);

  const options = customOptions ?? [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];

  const handleRadioChange = (e) => {
    input.onChange(e.target.value);
  };

  if (!isEditMode) {
    if (optionType !== "default") {
      const matching = options.find((opt) => opt.value === input.value);
      return <BaseViewInput label={label} value={matching?.label} />
    }
    const radioGroupClass = isVertical ? "vertical-radio-group view-item" : "view-item"
    return (
      <Form.Item
        id={id}
        getValueProps={() => ({ value: input.value })}
        name={input.name}
        label={<div className="view-item-label">{getFormItemLabel(label, false, labelSubtitle, false)}</div>}
        className="view-item"
      >
        <>
          <Radio.Group
            disabled={true}
            name={input.name}
            value={input.value}
            options={options}
            optionType={optionType}
            className={radioGroupClass}
            buttonStyle="solid"
          />
          {help && <div className={`form-item-help ${input.name}-form-help`}>{help}</div>}
        </>
      </Form.Item>
    );
  }

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
      label={getFormItemLabel(label, required, labelSubtitle, showOptional)}
    >
      <>
        <Radio.Group
          disabled={disabled}
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

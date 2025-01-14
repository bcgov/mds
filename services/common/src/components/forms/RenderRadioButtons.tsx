import React, { FC, useContext } from "react";
import { Form, Radio } from "antd";
import { BaseInputProps, BaseViewInput, getFormItemLabel } from "@mds/common/components/forms/BaseInput";
import { IRadioOption } from "@mds/common/interfaces";
import { FormContext, useFormContext } from "./FormWrapper";

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
  defaultValue,
  required = false,
  optionType = "default",
  isVertical = false,
  showOptional = true,
  rules = null,
}) => {
  const isEditMode = useContext(FormContext).isEditMode;
  const { isReduxForm } = useFormContext();

  const options = customOptions ?? [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];
  const [currentValue, setCurrentValue] = React.useState(meta?.initial || undefined);

  const handleRadioChange = (e) => {
    setCurrentValue(e.target.value);
    input.onChange(e.target.value);
  };


  const frm = Form.useFormInstance();
  const fld = frm.getFieldInstance(input.name);

  if (!isEditMode) {
    if (optionType !== "default") {
      const matching = options.find((opt) => opt.value === input.value);
      return <BaseViewInput label={label} value={matching?.label} />
    }
    const radioGroupClass = isVertical ? "vertical-radio-group view-item" : "view-item";
    return (
      <Form.Item
        id={id}
        getValueProps={() => ({ value: input.value })}
        name={input.name}
        label={<div className="view-item-label">{getFormItemLabel(label, false, labelSubtitle, false)}</div>}
        className="view-item"
        rules={rules}
      >
        <>
          <Radio.Group
            defaultValue={defaultValue}
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
      validateStatus={!isReduxForm ? undefined : meta.touched ? (meta.error && "error") || (meta.warning && "warning") : ""}
      help={
        !isReduxForm ? undefined :
          meta.touched &&
          ((meta.error && <span>{meta.error}</span>) || (meta.warning && <span>{meta.warning}</span>))
      }
      rules={rules}
      label={getFormItemLabel(label, required, labelSubtitle, showOptional)}
    >
      <>
        <Radio.Group
          disabled={disabled}
          name={input.name}
          value={isReduxForm ? input.value : currentValue}
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

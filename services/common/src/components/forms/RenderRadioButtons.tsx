import React, { FC } from "react";
import { Form, Radio } from "antd";
import { BaseInputProps, getFormItemLabel } from "@mds/common/components/forms/BaseInput";
import { IOption } from "@mds/common";

/**
 * @class RenderRadioButtons - Ant Design `Radio` component used for boolean values in redux-form.
 */

interface RenderRadioButtonsProps extends BaseInputProps {
  label: string;
  customOptions?: IOption[];
}

const RenderRadioButtons: FC<RenderRadioButtonsProps> = ({
  meta,
  label,
  disabled = false,
  input,
  id,
  customOptions,
  required = false,
}) => {
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
      <Radio.Group
        disabled={disabled}
        name={input.name}
        onChange={handleRadioChange}
        options={options}
      />
    </Form.Item>
  );
};

export default RenderRadioButtons;

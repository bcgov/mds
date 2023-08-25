import React, { FC } from "react";
import { Form, Radio } from "antd";

/**
 * @class RenderRadioButtons - Ant Design `Radio` component used for boolean values in redux-form.
 */

const defaultProps = {
  disabled: false,
  customOptions: null,
};

interface RenderRadioButtonsProps {
  id: string | number;
  label: string;
  meta: any;
  disabled: boolean;
  input: any;
  customOptions: { label: string; value: any }[];
}

const RenderRadioButtons: FC<RenderRadioButtonsProps> = (props) => {
  const { meta, label, disabled, input, id, customOptions } = props;

  const options = customOptions ?? [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];

  const handleRadioChange = (e) => {
    input.onChange(e.target.value);
  };

  return (
    <Form.Item
      validateStatus={meta.touched ? (meta.error && "error") || (meta.warning && "warning") : ""}
      help={
        meta.touched &&
        ((meta.error && <span>{meta.error}</span>) || (meta.warning && <span>{meta.warning}</span>))
      }
      label={label}
    >
      <Radio.Group
        disabled={disabled}
        name={input.name}
        value={input.value}
        onChange={handleRadioChange}
        id={id as string}
        options={options}
      />
    </Form.Item>
  );
};

RenderRadioButtons.defaultProps = defaultProps;

export default RenderRadioButtons;

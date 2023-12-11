import React from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import { Radio } from "antd";

/**
 * @class RenderRadioButtons - Ant Design `Radio` component used for boolean values in redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  disabled: PropTypes.bool,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  customOptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)),
};

const defaultProps = {
  disabled: false,
  customOptions: null,
};

const RenderRadioButtons = (props) => {
  const { meta, label, disabled, input, id, customOptions } = props;
  const radioValue = typeof input.value !== "undefined" ? input.value.toString() : "";

  const options = customOptions ?? [
    { label: "Yes", value: "true" },
    { label: "No", value: "false" },
  ];

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
        {...input}
        value={radioValue}
        defaultValue={radioValue}
        id={id}
        options={options}
      />
    </Form.Item>
  );
};

RenderRadioButtons.propTypes = propTypes;
RenderRadioButtons.defaultProps = defaultProps;

export default RenderRadioButtons;

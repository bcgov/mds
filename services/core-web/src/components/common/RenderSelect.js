import React from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Select } from "antd";
import CustomPropTypes from "@/customPropTypes";

/**
 * @constant RenderSelect - Ant Design `Select` component for redux-form - used for small data sets that (< 100);
 * There is a bug when the data sets are large enough to cause the dropdown to scroll, and the field is in a modal.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  meta: CustomPropTypes.formMeta,
  data: CustomPropTypes.options,
  disabled: PropTypes.bool,
  onSelect: PropTypes.func,
  usedOptions: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  placeholder: "Please select",
  label: "",
  data: [],
  disabled: false,
  meta: {},
  onSelect: () => {},
  usedOptions: [],
};

const RenderSelect = (props) => {
  return (
    <Form.Item
      label={props.label}
      validateStatus={
        props.meta.touched ? (props.meta.error && "error") || (props.meta.warning && "warning") : ""
      }
      help={
        props.meta.touched &&
        ((props.meta.error && <span>{props.meta.error}</span>) ||
          (props.meta.warning && <span>{props.meta.warning}</span>))
      }
      id={props.id}
      onSelect={props.onSelect}
      defaultValue={props.input.value}
      value={props.input.value ? props.input.value : null}
      onChange={props.input.onChange}
    >
      <Select
        virtual={false}
        disabled={props.disabled}
        allowClear
        dropdownMatchSelectWidth
        getPopupContainer={(trigger) => trigger.parentNode}
        showSearch
        dropdownStyle={{ position: "relative" }}
        placeholder={props.placeholder}
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        id={props.id}
        defaultValue={props.input.value}
        value={props.input.value ? props.input.value : null}
        onChange={props.input.onChange}
        onSelect={props.onSelect}
      >
        {props.data.map((opt) => (
          <Select.Option
            style={{ position: "relative" }}
            disabled={props.usedOptions && props.usedOptions.includes(opt.value)}
            key={opt.value}
            value={opt.value}
          >
            {opt.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

RenderSelect.propTypes = propTypes;
RenderSelect.defaultProps = defaultProps;

export default RenderSelect;

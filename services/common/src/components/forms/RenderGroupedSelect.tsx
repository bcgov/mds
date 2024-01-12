import React from "react";
import PropTypes from "prop-types";
import { Select, Form } from "antd";

/**
 * @constant RenderGroupedSelect - Ant Design `Select` component for redux-form - used for data sets that require grouping.
 * There is a bug when the data sets are large enough to cause the dropdown to scroll, and the field is in a modal.
 * In the case where the modal cannot scroll, it is better to pass in the prop doNotPinDropdown.  It allows the
 * dropdown to render properly
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  meta: PropTypes.any, //CustomPropTypes.formMeta,
  data: PropTypes.any, //CustomPropTypes.groupOptions,
  disabled: PropTypes.bool,
  onSelect: PropTypes.func,
  usedOptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
};

const defaultProps = {
  placeholder: "",
  label: "",
  data: [],
  disabled: false,
  meta: {},
  onSelect: () => {},
  usedOptions: [],
};

const RenderGroupedSelect = (props) => (
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
  >
    <Select
      virtual={false}
      disabled={props.disabled}
      dropdownMatchSelectWidth
      showSearch
      placeholder={props.placeholder}
      optionFilterProp="children"
      id={props.id}
      defaultValue={props.input.value}
      value={props.input.value ? props.input.value : undefined}
      onChange={props.input.onChange}
      onSelect={props.onSelect}
    >
      {props.data.map((group) => (
        <Select.OptGroup label={group.groupName} key={group.groupName}>
          {group.opt.map((opt) => (
            <Select.Option
              disabled={props.usedOptions && props.usedOptions.includes(opt.value)}
              key={opt.value}
              value={opt.value}
            >
              {opt.label}
            </Select.Option>
          ))}
        </Select.OptGroup>
      ))}
    </Select>
  </Form.Item>
);

RenderGroupedSelect.propTypes = propTypes;
RenderGroupedSelect.defaultProps = defaultProps;

export default RenderGroupedSelect;

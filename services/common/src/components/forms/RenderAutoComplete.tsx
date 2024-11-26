import React from "react";
import PropTypes from "prop-types";
import { Select, Form, Spin, Button } from "antd";
import { FormConsumer, IFormContext } from "./FormWrapper";
import { BaseViewInput } from "./BaseInput";

/**
 * @constant RenderAutoComplete - Ant Design `AutoComplete` component for redux-form.
 *
 */
const propTypes = {
  handleChange: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.any).isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  meta: PropTypes.objectOf(PropTypes.any),
  input: PropTypes.objectOf(PropTypes.any),
  selected: PropTypes.objectOf(PropTypes.any),
  loading: PropTypes.bool,
  addMissing: PropTypes.bool, // Allow selection of the current text typed into the search box
  style: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  placeholder: "",
  disabled: false,
  meta: {},
  input: null,
  selected: undefined,
  style: {},
};

const RenderAutoComplete = (props) => {
  const items = [...props.data];

  if (props.addMissing && props.input?.value?.trim().length > 0) {
    const isInputInList = items.find((item) => item.label === props.input.value);

    if (!isInputInList) {
      items.push({
        label: props.input.value,
        value: props.input.value,
      });
    }
  }
  return (
    <FormConsumer>
      {(value: IFormContext) => {
        if (!value.isEditMode) {
          return <BaseViewInput value={props.input.value} label={props.input.label} />;
        }

        const ariaLabel = props.label || props.input.name;

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
          >
            <Select
              aria-label={ariaLabel}
              showSearch
              virtual={false}
              defaultActiveFirstOption={false}
              aria-busy={props.loading}
              notFoundContent={props.loading ? <Spin size="small" /> : "Not found"}
              allowClear
              dropdownMatchSelectWidth
              defaultValue={props.input ? props.input.value : undefined}
              value={props.input ? props.input.value : undefined}
              style={{ width: "100%", ...(props.style || {}) }}
              options={items}
              placeholder={props.placeholder}
              filterOption={(input, option) =>
                option.label
                  .toString()
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
              disabled={props.disabled}
              onChange={props.input ? props.input.onChange : undefined}
              onSelect={props.handleSelect}
              onSearch={(event) => {
                props.handleChange(event);
                if (props.input) {
                  props.input.onChange(event);
                }
              }}
            />
          </Form.Item>);
      }}</FormConsumer>
  );
};

RenderAutoComplete.propTypes = propTypes;
RenderAutoComplete.defaultProps = defaultProps;

export default RenderAutoComplete;

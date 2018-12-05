import React from "react";
import PropTypes from "prop-types";
import { Form, AutoComplete, Input } from "antd";

/**
 * @constant RenderLargeSelect - Ant Design `AutoComplete` component for redux-form -- being used instead of 'RenderSelect' for large data sets that require a limit.
 */

const propTypes = {
  input: PropTypes.any,
  label: PropTypes.string,
  options: PropTypes.object,
  meta: PropTypes.object,
  data: PropTypes.array,
  option: PropTypes.object,
  handleChange: PropTypes.func,
  placeholder: PropTypes.string,
};

const transformData = (data, option) => {
  if (data) {
    const dataList = [];
    data.map((opt) => {
      dataList.push(
        <AutoComplete.Option key={opt} value={opt}>
          {option[opt].name}
        </AutoComplete.Option>
      );
    });
    return dataList;
  }
};
const RenderLargeSelect = ({
  id,
  data,
  options,
  label,
  placeholder,
  input,
  handleChange,
  meta: { touched, error, warning },
}) => (
  <Form.Item
    label={label}
    validateStatus={touched ? (error && "error") || (warning && "warning") : ""}
    help={touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
  >
    <AutoComplete
      getPopupContainer={() => document.getElementById(id)}
      id={id}
      defaultActiveFirstOption={false}
      notFoundContent={"Not Found"}
      dropdownMatchSelectWidth={true}
      backfill={true}
      style={{ width: "100%" }}
      dataSource={transformData(data, options)}
      placeholder={placeholder ? placeholder : "Select a party"} //TODO remove/refactor implimentation specific string
      filterOption={(input, option) =>
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      onSearch={handleChange}
      {...input}
    >
      <Input />
    </AutoComplete>
  </Form.Item>
);

RenderLargeSelect.propTypes = propTypes;

export default RenderLargeSelect;

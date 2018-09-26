import React from 'react';
import PropTypes from 'prop-types';
import { Form, AutoComplete, Input } from 'antd';


const propTypes = {
  input: PropTypes.any,
  label: PropTypes.string,
  opton: PropTypes.object,
  meta: PropTypes.object,
  data: PropTypes.array,
};

const transformData = (data, option) => {
  if (data) {
    const dataList = [];
    data.map((opt) => {
    dataList.push(
      <AutoComplete.Option key={opt} value={opt}>
        {option[opt].full_name}
      </AutoComplete.Option>
    )})
    return dataList;
  }
}

/**
 * Ant Design `AutoComplete` component for redux-form -- being used instead of select for large data sets that require a limit.
 */
const RenderLargeSelect = ({
  data,
  label,
  handleChange,
  option,
  input,
  meta: { touched, error, warning },
}) => (
    <Form.Item
      label={label}
      validateStatus={(touched ? ((error && 'error') || (warning && 'warning')) : '')}
      help={touched &&
        ((error && <span>{error}</span>) ||
          (warning && <span>{warning}</span>))
      }
    >
      <AutoComplete
        defaultActiveFirstOption={false}
        notFoundContent={'Not Found'}
        allowClear
        dropdownMatchSelectWidth={true}
        backfill={true}
        style={{ width: '100%' }}
        dataSource={transformData(data, option)}
        placeholder="Select a person"
        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        onChange={handleChange}
        {...input}
      >
        <Input />
      </AutoComplete>
    </Form.Item>
  );

RenderLargeSelect.propTypes = propTypes;

export default RenderLargeSelect;
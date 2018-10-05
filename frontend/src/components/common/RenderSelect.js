import React from 'react';
import PropTypes from 'prop-types';
import { Form, Select } from 'antd';


const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  input: PropTypes.any,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  opton: PropTypes.object,
  meta: PropTypes.object,
  data: PropTypes.array
};
/**
 * Ant Design `Select` component for redux-form.
 */
const RenderSelect = ({
  id,
  input,
  label,
  placeholder,
  meta: { touched, error, warning },
  data,
}) => (
    <Form.Item
      label={label}
      validateStatus={(touched ? ((error && 'error') || (warning && 'warning')) : '')}
      help={touched &&
        ((error && <span>{error}</span>) ||
          (warning && <span>{warning}</span>))
      }
    >
      <Select
        showSearch
        placeholder={placeholder}
        optionFilterProp="children"
        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        id={id} 
        {...input}
      >
        {data.map((value) => (
          <Select.Option key={value.value} value={value.value}>{value.option}</Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

RenderSelect.propTypes = propTypes;

export default RenderSelect;
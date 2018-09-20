import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { Icon, Input, AutoComplete } from 'antd';

const propTypes = {
  handleChange: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  placeholder: PropTypes.string
};

/**
 * Ant Design `AutoComplete` component for redux-form.
 * 
 */
const RenderAutoComplete = ({
  data,
  placeholder,
  handleChange,
  handleSelect
}) => (
    <AutoComplete
      defaultActiveFirstOption={false}
      notFoundContent={'Not Found'}
      allowClear
      dropdownMatchSelectWidth={true}
      size="large"
      backfill={true}
      style={{ width: '100%' }}
      dataSource={data}
      placeholder={placeholder}
      optionLabelProp="value"
      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
      onSelect={handleSelect}
      onChange={handleChange}
    >
      <Input suffix={<Icon type="search" style={{ color: '#537C52', fontSize: 20 }} />} />
    </AutoComplete>
  );

RenderAutoComplete.propTypes = propTypes;

export default RenderAutoComplete;

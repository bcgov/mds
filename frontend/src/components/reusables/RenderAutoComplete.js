import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Input, AutoComplete } from 'antd';

function options(data) {
  if (data) {
    return (
      data.map((opt) => {
      const search = opt.mine_name.concat(" - ", opt.mine_no);
      return (
        <AutoComplete.Option key={opt.guid} value={opt.guid}>
          {search}
        </AutoComplete.Option>
      )})
    )
  }
} 

const propTypes = {
  handleSearch: PropTypes.func,
  data: PropTypes.array
};

/**
 * Ant Design `AutoComplete` component for redux-form.
 */
const RenderAutoComplete = ({
  data,
  handleSearch,
}) => (
    <div>
      <AutoComplete
        dropdownMatchSelectWidth={true}
        size="large"
        style={{ width: '50%' }}
        dataSource={options(data)}
        placeholder="Search for a mine"
        optionLabelProp="value"
        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        onSelect={handleSearch}
      >
        <Input suffix={<Icon type="search" style={{ color: '#537C52', fontSize: 20 }} />} />
      </AutoComplete>
    </div>
  );

RenderAutoComplete.propTypes = propTypes;

export default RenderAutoComplete;

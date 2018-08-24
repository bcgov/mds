import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Input, AutoComplete } from 'antd';

function options(data) {
  if (data) {
    return (
      data.map((opt) => {
      const search = opt.mine_name.concat(" - ", opt.mine_no);
      return (
        <AutoComplete.Option key={opt.guid} value={opt.mine_no}>
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
    <div style={{ width: 300 }}>
      <AutoComplete
        dropdownMatchSelectWidth={true}
        size="large"
        style={{ width: '100%' }}
        dataSource={options(data)}
        placeholder="Search for a mine"
        optionLabelProp="value"
        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        onSelect={handleSearch}
      >
        <Input suffix={<Icon type="search" className="certain-category-icon" />} />
      </AutoComplete>
    </div>
  );

RenderAutoComplete.propTypes = propTypes;

export default RenderAutoComplete;

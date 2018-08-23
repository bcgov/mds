import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Input, AutoComplete, Button } from 'antd';

const mineDetails = [
    {
      guid: "5f3dd4f9-90e0-4159-8481-3ad70d34bd3f",
      mine_name: "Mine",
      mine_no: "BLAH7664"
    },
    {
      guid: "71ff4a8f-811e-42dc-af30-92ee24c6c03f",
      mine_name: "Test mine",
      mine_no: "BLAH0270"
    },
    {
      guid: "6461ce42-6c4e-4102-82fc-bc45ea3dd9c4",
      mine_name: "mine three",
      mine_no: "BLAH7147"
    },
    {
      guid: "c01a773f-0bca-40e9-95f7-b737e7c98abf",
      mine_name: "Mine 4",
      mine_no: "BLAH3925"
    },
    {
      guid: "da819f9f-c773-4e7e-a783-bfe21e586fd6",
      mine_name: "eleven",
      mine_no: "BLAH0560"
    },
    {
      guid: "d82ef27d-e591-4a83-81b2-e0e15d627f70",
      mine_name: "miiine",
      mine_no: "BLAH9590"
    }
]

const Option = AutoComplete.Option;
const OptGroup = AutoComplete.OptGroup;

const options = mineDetails.map(opt => (
      <Option key={opt.guid} value={opt.mine_name}>
        {opt.mine_name}
      </Option>
));

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  input: PropTypes.any,
  label: PropTypes.string,
  opton: PropTypes.object,
  meta: PropTypes.object,
  data: PropTypes.array
};
/**
 * Ant Design `Search` component for redux-form.
 */
const RenderSearch = ({
  data,
  handleSearch
}) => (
    <div style={{ width: 300 }}>
      <AutoComplete
        dropdownMatchSelectWidth={true}
        size="large"
        style={{ width: '100%' }}
        dataSource={options}
        placeholder="Search for a mine"
        optionLabelProp="value"
        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        onSelect={handleSearch}
      >
        <Input suffix={<Icon type="search" className="certain-category-icon" />} />
      </AutoComplete>
    </div>
  );

RenderSearch.propTypes = propTypes;

export default RenderSearch;

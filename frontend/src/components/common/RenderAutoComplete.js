import React from "react";
import PropTypes from "prop-types";
import { Icon, Input, AutoComplete } from "antd";

/**
 * @constant RenderAutoComplete - Ant Design `AutoComplete` component for redux-form.
 *
 */

const propTypes = {
  handleChange: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
};
const RenderAutoComplete = ({ data, placeholder, handleChange, handleSelect }) => (
  <AutoComplete
    defaultActiveFirstOption={false}
    notFoundContent="Not Found"
    allowClear
    dropdownMatchSelectWidth
    backfill
    style={{ width: "100%" }}
    dataSource={data}
    placeholder={placeholder}
    filterOption={(input, option) =>
      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
    onSelect={handleSelect}
    onChange={handleChange}
  >
    <Input id="search" suffix={<Icon type="search" style={{ color: "#5e46a1", fontSize: 20 }} />} />
  </AutoComplete>
);

RenderAutoComplete.propTypes = propTypes;

export default RenderAutoComplete;

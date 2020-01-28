import React from "react";
import PropTypes from "prop-types";
import { Icon, Input, AutoComplete } from "antd";
import * as Styles from "@/constants/styles";

/**
 * @constant RenderAutoComplete - Ant Design `AutoComplete` component for redux-form.
 *
 */

const propTypes = {
  handleChange: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.any).isRequired,
  placeholder: PropTypes.string,
  iconColor: PropTypes.string,
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool,
};

const defaultProps = {
  placeholder: "",
  defaultValue: "",
  iconColor: Styles.COLOR.violet,
  disabled: false,
};

const RenderAutoComplete = (props) => (
  <AutoComplete
    defaultActiveFirstOption={false}
    notFoundContent="Not Found"
    allowClear
    dropdownMatchSelectWidth
    backfill
    defaultValue={props.defaultValue}
    style={{ width: "100%" }}
    dataSource={props.data}
    placeholder={props.placeholder}
    filterOption={(input, option) =>
      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
    onSelect={props.handleSelect}
    onChange={props.handleChange}
    disabled={props.disabled}
  >
    <Input
      autoComplete="off"
      id="search"
      suffix={<Icon type="search" className="icon-sm" style={{ color: props.iconColor }} />}
    />
  </AutoComplete>
);

RenderAutoComplete.propTypes = propTypes;
RenderAutoComplete.defaultProps = defaultProps;

export default RenderAutoComplete;

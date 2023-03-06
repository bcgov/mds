import React from "react";
import PropTypes from "prop-types";
import { change } from "redux-form";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import "@ant-design/compatible/assets/index.css";
import { Checkbox } from "antd";
import CustomPropTypes from "@/customPropTypes";

/* eslint-disable react/prop-types */
const propTypes = {
  disabled: PropTypes.bool,
  data: CustomPropTypes.groupOptions,
};

const defaultProps = {
  data: [],
  disabled: false,
};

// an item is considered a child of another item when its subType matches the parent's value
const RenderParentGroupCheckbox = (props) => {
  const { data, disabled, input } = props;
  const parentCategories = data.filter((item) => {
    return item.subType === null;
  });
  const items = parentCategories.map((category) => {
    return {
      children: data.filter((item) => category.value === item.subType),
      ...category,
    };
  });

  return (
    <div>
      {items.map((item) => {
        const itemChecked = input.value.includes(item.value);
        const itemDisabled = disabled || (!item.isActive && !itemChecked);

        // TODO: change event so items can be clicked
        return (
          <>
            <Checkbox key={item.value} disabled={itemDisabled} checked={itemChecked}>
              {item.label}
            </Checkbox>
            {item.children && itemChecked && (
              // TODO: style child items
              <div style={{ marginTop: "20px" }}>
                {item.children.map((child) => {
                  return (
                    <Checkbox
                      key={child.value}
                      disabled={disabled}
                      checked={input.value.includes(child.value)}
                    >
                      {child.label}
                    </Checkbox>
                  );
                })}
              </div>
            )}
          </>
        );
      })}
    </div>
  );
};

RenderParentGroupCheckbox.propTypes = propTypes;
RenderParentGroupCheckbox.defaultProps = defaultProps;

const mapDispatchToProps = (dispatch) => bindActionCreators({ change }, dispatch);
export default connect(null, mapDispatchToProps)(RenderParentGroupCheckbox);

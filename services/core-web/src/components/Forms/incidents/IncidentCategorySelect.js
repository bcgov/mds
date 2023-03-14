import React from "react";
import PropTypes from "prop-types";
import "@ant-design/compatible/assets/index.css";
import { Typography, Alert, Checkbox, Row, Col } from "antd";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  disabled: PropTypes.bool,
  data: CustomPropTypes.options,
  meta: PropTypes.shape({
    initial: PropTypes.array,
  }).isRequired,
  input: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
    value: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

const defaultProps = {
  data: [],
  disabled: false,
};

// an item is considered a child of another item when its subType matches the parent's value
const IncidentCategorySelect = (props) => {
  const { data, disabled, input, meta } = props;
  const initialValues = meta?.initial ?? [];
  const historicalCategories = data.filter(
    (item) => !item.isActive && initialValues.includes(item.value)
  );
  const parentCategories = data.filter((item) => item.subType === null && item.isActive);

  const activeCategories = parentCategories.map((category) => {
    const children = data.filter((item) => category.value === item.subType);
    return {
      children,
      ...category,
    };
  });

  const onChange = (checkedValues) => {
    input.onChange(checkedValues);
  };

  return (
    <>
      <Checkbox.Group
        onChange={onChange}
        defaultValue={initialValues}
        value={input.value}
        disabled={disabled}
      >
        {historicalCategories.length > 0 && (
          <div style={{ border: "1px solid #5e46a1", borderRadius: "3px", padding: "1em 2em" }}>
            <Alert
              message="This incident uses legacy incident types"
              description="Please update this incident with additional categories."
              showIcon
              type="warning"
            />
            <Typography.Text>Legacy Categories</Typography.Text>
            <Row style={{ marginBottom: "15px" }}>
              {historicalCategories.map((category) => {
                return (
                  <Col span={12}>
                    <Checkbox value={category.value}>
                      <b>{category.label}</b>
                    </Checkbox>
                  </Col>
                );
              })}
            </Row>
          </div>
        )}
        <div
          style={{
            columnCount: 2,
            columnGap: 0,
          }}
        >
          {activeCategories.map((category) => {
            return category.children.length > 0 ? (
              <Col
                span={24}
                style={{
                  breakInside: "avoid-column",
                }}
              >
                <Typography.Text>
                  <b>{category.label}</b>
                </Typography.Text>
                {category.children.map((child) => {
                  return (
                    <Row style={{ padding: "6px" }}>
                      <Checkbox value={child.value}>{child.label}</Checkbox>
                    </Row>
                  );
                })}
              </Col>
            ) : (
              <Row
                style={{
                  breakInside: "avoid-column",
                  padding: "6px",
                }}
              >
                <Checkbox value={category.value}>
                  <b>{category.label}</b>
                </Checkbox>
              </Row>
            );
          })}
        </div>
      </Checkbox.Group>
    </>
  );
};

IncidentCategorySelect.propTypes = propTypes;
IncidentCategorySelect.defaultProps = defaultProps;

export default IncidentCategorySelect;

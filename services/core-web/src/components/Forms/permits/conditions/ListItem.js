import React, { useState } from "react";
import PropTypes from "prop-types";
import { Col, Row, Button } from "antd";
import { maxBy } from "lodash";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { TRASHCAN, EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import * as Permission from "@/constants/permissions";
import ListItemForm from "@/components/Forms/permits/conditions/ListItemForm";
import NestedSubCondition from "@/components/Forms/permits/conditions/NestedSubCondition";
import AddCondition from "@/components/Forms/permits/conditions/AddCondition";

const propTypes = {
  condition: PropTypes.objectOf(PropTypes.any),
  new: PropTypes.bool,
  handleSubmit: PropTypes.func,
  handleCancel: PropTypes.func,
  handleDelete: PropTypes.func,
  reorderConditions: PropTypes.func,
  setConditionEditingFlag: PropTypes.func,
  initialValues: PropTypes.objectOf(PropTypes.any),
  editingConditionFlag: PropTypes.bool.isRequired,
  isViewOnly: PropTypes.bool,
};

const defaultProps = {
  condition: undefined,
  new: false,
  handleSubmit: () => {},
  handleCancel: () => {},
  handleDelete: () => {},
  reorderConditions: () => {},
  setConditionEditingFlag: () => {},
  initialValues: {},
  isViewOnly: false,
};

const ListItem = (props) => {
  // eslint-disable-next-line no-unused-vars
  const [isEditing, setIsEditing] = useState(props.new);
  return (
    <>
      <Row gutter={[8, 16]} className={isEditing || props.isViewOnly ? " " : "hover-row"}>
        {!isEditing && <Col span={2} />}
        <Col span={props.isViewOnly ? 2 : 1}>{!isEditing && props.condition.step}</Col>
        <Col span={props.isViewOnly ? 16 : 17}>
          {!isEditing && props.condition.condition}
          {isEditing && (
            <ListItemForm
              onCancel={() => {
                setIsEditing(!isEditing);
                props.setConditionEditingFlag(false);
                props.handleCancel(false);
              }}
              onSubmit={(values) => props.handleSubmit(values).then(() => setIsEditing(!isEditing))}
              initialValues={props.condition || props.initialValues}
            />
          )}
        </Col>
        <Col span={3} className="float-right show-on-hover">
          {!isEditing && !props.isViewOnly && (
            <div className="float-right">
              <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT">
                <Button
                  ghost
                  className="no-margin"
                  size="small"
                  type="primary"
                  onClick={() => {
                    props.reorderConditions(props.condition, true);
                  }}
                  disabled={props.editingConditionFlag}
                >
                  <UpOutlined />
                </Button>
              </NOWActionWrapper>
              <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT">
                <Button
                  ghost
                  className="no-margin"
                  size="small"
                  type="primary"
                  onClick={() => {
                    props.reorderConditions(props.condition, false);
                  }}
                  disabled={props.editingConditionFlag}
                >
                  <DownOutlined />
                </Button>
              </NOWActionWrapper>
              <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT">
                <Button
                  ghost
                  className="no-margin"
                  size="small"
                  type="primary"
                  onClick={() => {
                    props.setConditionEditingFlag(true);
                    setIsEditing(!isEditing);
                  }}
                  disabled={props.editingConditionFlag}
                >
                  <img
                    className={props.editingConditionFlag ? "disabled-icon" : ""}
                    name="edit"
                    src={EDIT_OUTLINE_VIOLET}
                    alt="Edit Condition"
                  />
                </Button>
              </NOWActionWrapper>
              <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT">
                <Button
                  ghost
                  className="no-margin"
                  size="small"
                  type="primary"
                  onClick={() => props.handleDelete(props.condition)}
                  disabled={props.editingConditionFlag}
                >
                  <img
                    className={props.editingConditionFlag ? "disabled-icon" : ""}
                    name="remove"
                    src={TRASHCAN}
                    alt="Remove Condition"
                  />
                </Button>
              </NOWActionWrapper>
            </div>
          )}
        </Col>
      </Row>
      {props.condition &&
        props.condition.sub_conditions.map((condition) => (
          <NestedSubCondition
            condition={condition}
            reorderConditions={props.reorderConditions}
            handleSubmit={props.handleSubmit}
            handleDelete={props.handleDelete}
            setConditionEditingFlag={props.setConditionEditingFlag}
            editingConditionFlag={props.editingConditionFlag}
            isViewOnly={props.isViewOnly}
          />
        ))}

      {!isEditing && !props.isViewOnly && (
        <Row gutter={[8, 16]}>
          <Col span={22} offset={2}>
            <AddCondition
              initialValues={{
                condition_category_code: props.condition.condition_category_code,
                condition_type_code: "CON",
                display_order:
                  props.condition.sub_conditions.length === 0
                    ? 1
                    : maxBy(props.condition.sub_conditions, "display_order").display_order + 1,
                parent_permit_condition_id: props.condition.permit_condition_id,
                permit_amendment_id: props.condition.permit_amendment_id,
              }}
            />
          </Col>
        </Row>
      )}
    </>
  );
};

ListItem.propTypes = propTypes;
ListItem.defaultProps = defaultProps;

export default ListItem;

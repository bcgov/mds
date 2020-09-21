import React, { useState } from "react";
import PropTypes from "prop-types";
import { Col, Row, Button } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { maxBy } from "lodash";
import { TRASHCAN, EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import Condition from "@/components/Forms/permits/conditions/Condition";
import SectionForm from "@/components/Forms/permits/conditions/SectionForm";
import AddCondition from "./AddCondition";

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

const Section = (props) => {
  // eslint-disable-next-line no-unused-vars
  const [isEditing, setIsEditing] = useState(props.new);
  return (
    <>
      {props.condition &&
        props.condition.sub_conditions.length === 0 &&
        props.condition.display_order !== 1 && (
          <Row gutter={32}>
            <Col span={24}>&nbsp;</Col>
          </Row>
        )}
      <Row gutter={[32, 32]}>
        {!isEditing && <Col span={1}>{props.condition.step}</Col>}
        {!isEditing && (
          <Col span={18} className="field-title">
            {props.condition.condition}
          </Col>
        )}
        {isEditing && (
          <Col span={18}>
            <SectionForm
              onCancel={() => {
                setIsEditing(!isEditing);
                props.setConditionEditingFlag(false);
                props.handleCancel(false);
              }}
              onSubmit={(values) => props.handleSubmit(values).then(() => setIsEditing(!isEditing))}
              initialValues={props.condition || props.initialValues}
            />
          </Col>
        )}
        <Col span={4} className="float-right">
          {!isEditing && !props.isViewOnly && (
            <div className="float-right">
              <AuthorizationWrapper permission={Permission.ADMIN}>
                <Button
                  className="no-margin"
                  ghost
                  size="small"
                  type="primary"
                  onClick={() => {
                    props.reorderConditions(props.condition, true);
                  }}
                  disabled={props.editingConditionFlag}
                >
                  <UpOutlined />
                </Button>
              </AuthorizationWrapper>
              <AuthorizationWrapper permission={Permission.ADMIN}>
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
              </AuthorizationWrapper>
              <AuthorizationWrapper permission={Permission.ADMIN}>
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
              </AuthorizationWrapper>
              <AuthorizationWrapper permission={Permission.ADMIN}>
                <Button
                  className="no-margin"
                  ghost
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
              </AuthorizationWrapper>
            </div>
          )}
        </Col>
      </Row>
      {props.condition &&
        props.condition.sub_conditions.map((condition) => (
          <Condition
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
        <Row gutter={32}>
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
      <Row gutter={32}>
        <Col span={24}>&nbsp;</Col>
      </Row>
    </>
  );
};

Section.propTypes = propTypes;
Section.defaultProps = defaultProps;

export default Section;

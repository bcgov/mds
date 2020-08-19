import React, { useState } from "react";
import PropTypes from "prop-types";
import { Form, Col, Row, Popconfirm, Button } from "antd";
import { maxBy } from "lodash";
import { EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
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
  setConditionEditingFlag: PropTypes.func,
  initialValues: PropTypes.objectOf(PropTypes.any),
  editingConditionFlag: PropTypes.bool.isRequired,
};

const defaultProps = {
  condition: undefined,
  new: false,
  handleSubmit: () => {},
  handleCancel: () => {},
  handleDelete: () => {},
  setConditionEditingFlag: () => {},
  initialValues: {},
};

const Section = (props) => {
  const [isEditing, setIsEditing] = useState(props.new);

  return (
    <>
      {props.condition &&
        props.condition.sub_conditions.length === 0 &&
        props.condition.display_order !== 1 && (
          <Row gutter={32}>
            <Col>&nbsp;</Col>
          </Row>
        )}
      <Row gutter={32}>
        {!isEditing && <Col span={2}>{props.condition.step}</Col>}
        {!isEditing && (
          <Col span={18} className="field-title">
            {props.condition.condition}
          </Col>
        )}
        {isEditing && (
          <Col span={20}>
            <SectionForm
              onCancel={() => {
                setIsEditing(!isEditing);
                props.setConditionEditingFlag(false);
                props.handleCancel(false);
              }}
              onSubmit={props.handleSubmit}
              initialValues={props.condition || props.initialValues}
            />
          </Col>
        )}
        <Col span={3} className="float-right">
          {!isEditing && !props.editingConditionFlag && (
            <div>
              <Button
                ghost
                size="small"
                type="primary"
                onClick={() => {
                  props.setConditionEditingFlag(true);
                  setIsEditing(!isEditing);
                }}
              >
                <img name="edit" src={EDIT_OUTLINE_VIOLET} alt="Edit Condition" />
              </Button>
              <AuthorizationWrapper permission={Permission.ADMIN}>
                <Popconfirm
                  placement="topLeft"
                  title="Are you sure you want to delete this condition?"
                  onConfirm={() => props.handleDelete(props.condition.permit_condition_guid)}
                  okText="Delete"
                  cancelText="Cancel"
                >
                  <Button ghost size="small" type="primary">
                    <img name="remove" src={TRASHCAN} alt="Remove Condition" />
                  </Button>
                </Popconfirm>
              </AuthorizationWrapper>
            </div>
          )}
        </Col>
      </Row>
      {props.condition &&
        props.condition.sub_conditions.map((condition) => (
          <Condition
            condition={condition}
            handleSubmit={props.handleEdit}
            handleDelete={props.handleDelete}
            setConditionEditingFlag={props.setConditionEditingFlag}
          />
        ))}
      {!isEditing && (
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
        <Col>&nbsp;</Col>
      </Row>
    </>
  );
};

Section.propTypes = propTypes;
Section.defaultProps = defaultProps;

export default Section;

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
  initialValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  condition: {
    step: "",
    condition: "",
    sub_conditions: [],
  },
  new: false,
  handleSubmit: () => {},
  handleCancel: () => {},
  initialValues: {},
};

const Section = (props) => {
  const [isEditing, setIsEditing] = useState(props.new);
  return (
    <>
      <Row gutter={32}>
        {!isEditing && <Col md={2}>{props.condition.step}</Col>}
        {!isEditing && (
          <Col md={20} className="field-title">
            {props.condition.condition}
          </Col>
        )}
        {isEditing && (
          <Col>
            <SectionForm
              onCancel={props.handleCancel}
              onSubmit={props.handleSubmit}
              initialValues={props.initialValues}
            />
          </Col>
        )}
        <Col md={1}>
          {!isEditing && (
            <div align="right" className="btn--middle flex float-right">
              <AuthorizationWrapper permission={Permission.ADMIN}>
                <Popconfirm
                  placement="topLeft"
                  title="Are you sure you want to delete this condition?"
                  onConfirm={() => {}}
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
      {props.condition.sub_conditions.map((condition) => (
        <Condition condition={condition} handleSubmit={props.handleSubmit} />
      ))}
      {!isEditing && (
        <Row>
          <Col md={2} />
          <Col>
            <AddCondition
              initialValues={{
                condition_category_code: props.condition.condition_category_code,
                condition_type_code: "CON",
                display_order:
                  props.condition.sub_conditions.length === 0
                    ? 1
                    : maxBy(props.condition.sub_conditions, "display_order").display_order + 1,
                parent_condition_id: props.condition.permit_condition_id,
                permit_amendment_id: props.condition.permit_amendment_id,
              }}
            />
          </Col>
        </Row>
      )}
      <Row gutter={32}>
        <Col>&nbsp;</Col>
      </Row>
      <Row gutter={32}>
        <Col>&nbsp;</Col>
      </Row>
    </>
  );
};

Section.propTypes = propTypes;
Section.defaultProps = defaultProps;

export default Section;

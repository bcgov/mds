import React, { useState } from "react";
import PropTypes from "prop-types";
import { Col, Row, Button } from "antd";
import { maxBy } from "lodash";
import { TRASHCAN } from "@/constants/assets";
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
  initialValues: PropTypes.objectOf(PropTypes.any),
  isViewOnly: PropTypes.bool,
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
  handleDelete: () => {},
  initialValues: {},
  isViewOnly: false,
};

const Section = (props) => {
  // eslint-disable-next-line no-unused-vars
  const [isEditing, setIsEditing] = useState(props.new);
  return (
    <>
      {props.condition.sub_conditions.length === 0 && props.condition.display_order !== 1 && (
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
              onCancel={props.handleCancel}
              onSubmit={props.handleSubmit}
              initialValues={props.initialValues}
            />
          </Col>
        )}
        <Col span={2} className="float-right">
          {!isEditing && !props.isViewOnly && (
            <AuthorizationWrapper permission={Permission.ADMIN}>
              <Button
                ghost
                size="small"
                type="primary"
                onClick={() => props.handleDelete(props.condition)}
              >
                <img name="remove" src={TRASHCAN} alt="Remove Condition" />
              </Button>
            </AuthorizationWrapper>
          )}
        </Col>
      </Row>
      {props.condition.sub_conditions.map((condition) => (
        <Condition
          condition={condition}
          handleSubmit={props.handleSubmit}
          handleDelete={props.handleDelete}
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
        <Col>&nbsp;</Col>
      </Row>
    </>
  );
};

Section.propTypes = propTypes;
Section.defaultProps = defaultProps;

export default Section;

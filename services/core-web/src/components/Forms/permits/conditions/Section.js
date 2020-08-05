import React, { useState } from "react";
import PropTypes from "prop-types";
import { Col, Row, Popconfirm, Button } from "antd";
import { EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/AddButton";
import Condition from "@/components/Forms/permits/conditions/Condition";

const propTypes = {
  condition: PropTypes.objectOf(PropTypes.any),
  new: PropTypes.bool,
};

const defaultProps = {
  condition: {
    step: "",
    condition: "",
    sub_conditions: [],
  },
  new: false,
};

const Section = (props) => {
  const [isEditing, setIsEditing] = useState(props.new);
  return (
    <>
      <Row gutter={32}>
        <Col md={2}>{!isEditing && props.condition.step}</Col>
        <Col md={18}>
          <Row>
            {!isEditing && <Col className="field-title">{props.condition.condition}</Col>}
            {isEditing && <Col>Edit</Col>}
          </Row>
        </Col>
        <Col md={4}>
          {!isEditing && (
            <div align="right" className="btn--middle flex">
              <AuthorizationWrapper permission={Permission.ADMIN}>
                <Button type="primary" size="small" ghost onClick={() => {}}>
                  <img src={EDIT_OUTLINE_VIOLET} alt="Edit Condition" />
                </Button>
              </AuthorizationWrapper>
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
      {!isEditing &&
        props.condition.sub_conditions.map((condition) => <Condition condition={condition} />)}
      {!isEditing && (
        <Row>
          <Col md={2} />
          <Col>
            <AddButton type="secondary">Add Condition</AddButton>
          </Col>
        </Row>
      )}
    </>
  );
};

Section.propTypes = propTypes;
Section.defaultProps = defaultProps;

export default Section;

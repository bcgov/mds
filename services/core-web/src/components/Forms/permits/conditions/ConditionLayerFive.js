import React, { useState } from "react";
import PropTypes from "prop-types";
import { Col, Row, Button } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import Highlight from "react-highlighter";
import { highlightPermitConditionVariables } from "@common/utils/helpers";
import { TRASHCAN, EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import * as Permission from "@mds/common/constants/permissions";
import ConditionForm from "@/components/Forms/permits/conditions/ConditionForm";

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

export const ConditionLayerFive = (props) => {
  // eslint-disable-next-line no-unused-vars
  const [isEditing, setIsEditing] = useState(props.new);
  return (
    <>
      <Row gutter={[8, 16]} className={isEditing || props.isViewOnly ? "" : "hover-row"}>
        {!isEditing && <Col span={4} />}
        <Col span={props.isViewOnly ? 2 : 1}>{!isEditing && props.condition.step}</Col>
        <Col span={props.isViewOnly ? 14 : 15}>
          {!isEditing && (
            <Highlight className="injectable-string" search={highlightPermitConditionVariables()}>
              {props.condition.condition}
            </Highlight>
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
      {isEditing && (
        <ConditionForm
          onCancel={() => {
            setIsEditing(!isEditing);
            props.setConditionEditingFlag(false);
            props.handleCancel(false);
          }}
          onSubmit={(values) => props.handleSubmit(values).then(() => setIsEditing(!isEditing))}
          initialValues={props.condition || props.initialValues}
          layer={5}
        />
      )}
    </>
  );
};

ConditionLayerFive.propTypes = propTypes;
ConditionLayerFive.defaultProps = defaultProps;

export default ConditionLayerFive;

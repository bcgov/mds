import React, { useState } from "react";
import PropTypes from "prop-types";
import { Col, Row, Button } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { TRASHCAN, EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import * as Permission from "@/constants/permissions";
import ListItemForm from "@/components/Forms/permits/conditions/ListItemForm";

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
      {props.condition && props.condition.display_order === 1 && (
        <Row gutter={32}>
          <Col span={24}>&nbsp;</Col>
        </Row>
      )}
      <Row gutter={[16, 32]}>
        {!isEditing && <Col span={3} />}
        <Col span={props.isViewOnly ? 2 : 1}>{!isEditing && props.condition.step}</Col>
        <Col span={props.isViewOnly ? 15 : 16}>
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
        <Col span={4} className="float-right">
          {!isEditing && !props.isViewOnly && (
            <div className="float-right">
              <NOWActionWrapper permission={Permission.EDIT_PERMITS}>
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
              <NOWActionWrapper permission={Permission.EDIT_PERMITS}>
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
              <NOWActionWrapper permission={Permission.EDIT_PERMITS}>
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
              <NOWActionWrapper permission={Permission.EDIT_PERMITS}>
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
    </>
  );
};

ListItem.propTypes = propTypes;
ListItem.defaultProps = defaultProps;

export default ListItem;

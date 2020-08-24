import React, { useState } from "react";
import PropTypes from "prop-types";
import { Col, Row, Button } from "antd";
import { TRASHCAN, EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import ListItemForm from "@/components/Forms/permits/conditions/ListItemForm";

const propTypes = {
  condition: PropTypes.objectOf(PropTypes.any),
  new: PropTypes.bool,
  handleSubmit: PropTypes.func,
  handleCancel: PropTypes.func,
  handleDelete: PropTypes.func,
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
          <Col>&nbsp;</Col>
        </Row>
      )}
      <Row gutter={32}>
        {!isEditing && <Col span={3} />}
        <Col span={props.isViewOnly ? 2 : 1}>{!isEditing && props.condition.step}</Col>
        <Col span={props.isViewOnly ? 17 : 18}>
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
        <Col span={3} className="float-right">
          {!isEditing && !props.isViewOnly && (
            <div>
              <AuthorizationWrapper permission={Permission.ADMIN}>
                <Button
                  ghost
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
    </>
  );
};

ListItem.propTypes = propTypes;
ListItem.defaultProps = defaultProps;

export default ListItem;

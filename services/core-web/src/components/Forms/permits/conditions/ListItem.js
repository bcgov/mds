import React, { useState } from "react";
import PropTypes from "prop-types";
import { Col, Row, Popconfirm, Button } from "antd";
import { EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import ListItemForm from "@/components/Forms/permits/conditions/ListItemForm";

const propTypes = {
  condition: PropTypes.objectOf(PropTypes.any),
  new: PropTypes.bool,
  handleSubmit: PropTypes.func,
  handleCancel: PropTypes.func,
  handleDelete: PropTypes.func,
  handleEdit: PropTypes.func,
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
  handleDelete: () => {},
  handleEdit: () => {},
  initialValues: {},
};

const ListItem = (props) => {
  const [isEditing, setIsEditing] = useState(props.new);
  return (
    <>
      {props.condition.display_order === 1 && (
        <Row gutter={32}>
          <Col>&nbsp;</Col>
        </Row>
      )}
      <Row gutter={32}>
        {!isEditing && <Col span={3} />}
        <Col span={1}>{!isEditing && props.condition.step}</Col>
        <Col span={18}>
          {!isEditing && props.condition.condition}
          {isEditing && (
            <ListItemForm
              onCancel={props.handleCancel}
              onSubmit={props.handleEdit}
              initialValues={props.initialValues}
            />
          )}
        </Col>
        <Col span={3} className="float-right">
          {!isEditing && (
            <div>
              <Button
                ghost
                size="small"
                type="primary"
                onClick={() => {
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
    </>
  );
};

ListItem.propTypes = propTypes;
ListItem.defaultProps = defaultProps;

export default ListItem;

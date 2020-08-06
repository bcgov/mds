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

const ListItem = (props) => {
  const [isEditing, setIsEditing] = useState(props.new);
  return (
    <Row gutter={32}>
      <Col md={2} />
      <Col md={1}>{!isEditing && props.condition.step}</Col>
      <Col md={20} offset={2}>
        {!isEditing && props.condition.condition}
        {isEditing && (
          <ListItemForm
            onCancel={props.handleCancel}
            onSubmit={props.handleSubmit}
            initialValues={props.initialValues}
          />
        )}
      </Col>
      <Col md={2}>
        {!isEditing && (
          <div className="btn--middle flex float-right">
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
  );
};

ListItem.propTypes = propTypes;
ListItem.defaultProps = defaultProps;

export default ListItem;

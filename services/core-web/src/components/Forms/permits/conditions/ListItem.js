import React, { useState } from "react";
import PropTypes from "prop-types";
import { Col, Row, Button } from "antd";
import { TRASHCAN } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import ListItemForm from "@/components/Forms/permits/conditions/ListItemForm";

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

const ListItem = (props) => {
  // eslint-disable-next-line no-unused-vars
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
        <Col span={props.isViewOnly ? 2 : 1}>{!isEditing && props.condition.step}</Col>
        <Col span={props.isViewOnly ? 17 : 18}>
          {!isEditing && props.condition.condition}
          {isEditing && (
            <ListItemForm
              onCancel={props.handleCancel}
              onSubmit={props.handleSubmit}
              initialValues={props.initialValues}
            />
          )}
        </Col>
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
    </>
  );
};

ListItem.propTypes = propTypes;
ListItem.defaultProps = defaultProps;

export default ListItem;

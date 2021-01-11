import React, { useState } from "react";
import PropTypes from "prop-types";
import ConditionForm from "@/components/Forms/permits/conditions/ConditionForm";

const propTypes = {
  condition: PropTypes.objectOf(PropTypes.any),
  new: PropTypes.bool,
  handleSubmit: PropTypes.func,
  handleCancel: PropTypes.func,
  setConditionEditingFlag: PropTypes.func,
  initialValues: PropTypes.objectOf(PropTypes.any),
  layer: PropTypes.number,
};

const defaultProps = {
  condition: undefined,
  new: false,
  handleSubmit: () => {},
  handleCancel: () => {},
  setConditionEditingFlag: () => {},
  initialValues: {},
  layer: 0,
};

const Condition = (props) => {
  const space = props.new ? props.layer + 1 : props.layer;
  // eslint-disable-next-line no-unused-vars
  const [isEditing, setIsEditing] = useState(props.new);
  return (
    <>
      {isEditing && (
        <ConditionForm
          layer={space}
          onCancel={() => {
            setIsEditing(!isEditing);
            props.setConditionEditingFlag(false);
            props.handleCancel(false);
          }}
          onSubmit={(values) => props.handleSubmit(values).then(() => setIsEditing(!isEditing))}
          initialValues={props.condition || props.initialValues}
        />
      )}
    </>
  );
};

Condition.propTypes = propTypes;
Condition.defaultProps = defaultProps;

export default Condition;

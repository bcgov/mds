import React, { useState } from "react";
import PropTypes from "prop-types";
import AddButton from "@/components/common/AddButton";
import Section from "@/components/Forms/permits/conditions/Section";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

const defaultProps = {};

const AddSection = (props) => {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <>
      {!isEditing && (
        <AddButton type="secondary" onClick={() => setIsEditing(true)}>
          Add Sub-Section
        </AddButton>
      )}
      {isEditing && (
        <Section
          new
          handleSubmit={(values) => {
            setIsEditing(false);
            props.handleSubmit(values);
          }}
          initialValues={props.initialValues}
        />
      )}
    </>
  );
};

AddSection.propTypes = propTypes;
AddSection.defaultProps = defaultProps;

export default AddSection;

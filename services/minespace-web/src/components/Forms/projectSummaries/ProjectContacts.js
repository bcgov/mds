/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Field, FormSection, FieldArray } from "redux-form";
import { maxLength } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";

const propTypes = {};

export const ProjectContacts = (props) => {
  const contacts = ({ fields }) => {
    return (
      <>
        {fields.map((field, index) => {
          // const documentExists = fields.get(index) && fields.get(index).mine_document_guid;
          return (
            <div key={index}>
              <Field
                name={`${field}.name`}
                id={`${field}.name`}
                label="Project title"
                component={renderConfig.AUTO_SIZE_FIELD}
                validate={[maxLength(300)]}
              />
              <Field
                id="proponent_project_id"
                name="proponent_project_id"
                label="Proponent project tracking ID (optional)"
                component={renderConfig.FIELD}
                validate={[maxLength(300)]}
              />
              <Field
                id="project_summary_description"
                name="project_summary_description"
                label="Project overview"
                component={renderConfig.AUTO_SIZE_FIELD}
                validate={[maxLength(300)]}
              />
            </div>
          );
        })}
      </>
    );
  };
  return (
    <>
      <h1>Contacts</h1>
      <FieldArray name="contacts" component={contacts} />
    </>
  );
};

ProjectContacts.propTypes = propTypes;

export default ProjectContacts;

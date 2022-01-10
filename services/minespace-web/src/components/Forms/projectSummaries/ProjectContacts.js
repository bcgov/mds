/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Typography, Button, Row, Col } from "antd";
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
                name={`${field}.is_primary`}
                id={`${field}.is_primary`}
                label="Is this the Primary contact?"
                component={renderConfig.RADIO}
              />
              <Field
                name={`${field}.name`}
                id={`${field}.name`}
                label="Name"
                component={renderConfig.FIELD}
                validate={[maxLength(300)]}
              />
              <Field
                name={`${field}.job_title`}
                id={`${field}.job_title`}
                label="Job Title (optional)"
                component={renderConfig.FIELD}
                validate={[maxLength(300)]}
              />
              <Field
                name={`${field}.company_name`}
                id={`${field}.company_name`}
                label="Company name (optional)"
                component={renderConfig.FIELD}
                validate={[maxLength(300)]}
              />
              <Field
                name={`${field}.email`}
                id={`${field}.email`}
                label="Email"
                component={renderConfig.FIELD}
                validate={[maxLength(300)]}
              />
              <Row gutter={16}>
                <Col span={20}>
                  <Field
                    name={`${field}.phone_number`}
                    id={`${field}.phone_number`}
                    label="Phone Number"
                    component={renderConfig.FIELD}
                    validate={[maxLength(300)]}
                  />
                </Col>
                <Col span={4}>
                  <Field
                    name={`${field}.phone_extension`}
                    id={`${field}.phone_extension`}
                    label="Ext. (optional)"
                    component={renderConfig.FIELD}
                    validate={[maxLength(300)]}
                  />
                </Col>
              </Row>
            </div>
          );
        })}
        <Button onClick={() => fields.push({})}>Add</Button>
      </>
    );
  };
  return (
    <>
      <Typography.Title level={3}>Project Contacts</Typography.Title>
      <FieldArray name="contacts" component={contacts} />
    </>
  );
};

ProjectContacts.propTypes = propTypes;

export default ProjectContacts;

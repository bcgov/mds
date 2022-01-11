/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Typography, Button, Row, Col, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Field, FormSection, FieldArray } from "redux-form";
import { PlusOutlined } from "@ant-design/icons";
import { maxLength, phoneNumber, required, email } from "@common/utils/Validate";
import { normalizePhone } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {};

export const ProjectContacts = (props) => {
  const contacts = ({ fields }) => {
    return (
      <>
        {fields.map((field, index) => {
          // const documentExists = fields.get(index) && fields.get(index).mine_document_guid;
          return (
            <div key={index}>
              {index === 0 ? (
                <>
                  <Typography.Title level={5}>Primary project contact</Typography.Title>
                  <Typography.Paragraph>
                    Provide contact information for the person who has the main responsibility for
                    coordinating this project.
                  </Typography.Paragraph>
                </>
              ) : (
                <>
                  <Row gutter={16}>
                    <Col span={7}>
                      <Typography.Title level={5}>
                        Additional project contact #{index}
                      </Typography.Title>
                    </Col>
                    <Col span={17}>
                      <Popconfirm
                        placement="topLeft"
                        title="Are you sure you want to remove this contact?"
                        onConfirm={() => fields.remove(index)}
                        okText="Remove"
                        cancelText="Cancel"
                      >
                        <Button type="primary" size="small" ghost>
                          <DeleteOutlined className="padding-sm--left icon-sm" />
                        </Button>
                      </Popconfirm>
                    </Col>
                  </Row>
                </>
              )}
              <Field
                name={`${field}.name`}
                id={`${field}.name`}
                label="Name"
                component={renderConfig.FIELD}
                validate={[required]}
              />
              <Field
                name={`${field}.job_title`}
                id={`${field}.job_title`}
                label="Job Title (optional)"
                component={renderConfig.FIELD}
              />
              <Field
                name={`${field}.company_name`}
                id={`${field}.company_name`}
                label="Company name (optional)"
                component={renderConfig.FIELD}
              />
              <Field
                name={`${field}.email`}
                id={`${field}.email`}
                label="Email"
                component={renderConfig.FIELD}
                validate={[required, email]}
              />
              <Row gutter={16}>
                <Col span={20}>
                  <Field
                    name={`${field}.phone_number`}
                    id={`${field}.phone_number`}
                    label="Phone Number"
                    component={renderConfig.FIELD}
                    validate={[phoneNumber, maxLength(12)]}
                    normalize={normalizePhone}
                  />
                </Col>
                <Col span={4}>
                  <Field
                    name={`${field}.phone_extension`}
                    id={`${field}.phone_extension`}
                    label="Ext. (optional)"
                    component={renderConfig.FIELD}
                  />
                </Col>
              </Row>
              {index === 0 && (
                <>
                  <Typography.Title level={3}>
                    Additional project contacts (optional)
                  </Typography.Title>
                  <Typography.Paragraph>
                    Provide contact information for additional people we can contact about this
                    project.
                  </Typography.Paragraph>
                </>
              )}
            </div>
          );
        })}
        <LinkButton
          onClick={() => fields.push({ is_primary: false })}
          title="Add additional project contacts"
        >
          <PlusOutlined /> Add additional project contacts
        </LinkButton>
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

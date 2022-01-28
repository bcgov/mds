/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Typography, Row, Col } from "antd";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import DocumentTable from "@/components/common/DocumentTable";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any),
  initialValues: PropTypes.objectOf(PropTypes.any),
  projectSummaryStatusCodesOptions: CustomPropTypes.options.isRequired,
  projectSummaryDocumentTypesOptions: CustomPropTypes.options.isRequired,
};

const defaultProps = {
  formValues: {},
  initialValues: {},
};

const transformAuthorizationTypes = (types) => {
  const transformedObject = {};
  for (const type of types) {
    for (const childType of type.children) {
      transformedObject[childType.code] = {
        description: childType.description,
        parent: { code: type.code, description: type.description },
      };
    }
  }
  return transformedObject;
};

export const ProjectSummaryForm = (props) => {
  const renderProjectDetails = () => {
    return (
      <div id="project-details">
        <Typography.Title level={3}>Project details</Typography.Title>
        <Row gutter={16}>
          <Col lg={12} md={24}>
            <Form.Item>
              <Field
                id="proponent_project_id"
                name="proponent_project_id"
                label="Project number"
                component={renderConfig.FIELD}
                disabled
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="project_summary_description"
                name="project_summary_description"
                label="Executive summary"
                component={renderConfig.AUTO_SIZE_FIELD}
                disabled
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  };

  const renderAuthorizationsInvolved = () => {
    const {
      initialValues: { authorizations },
      projectSummaryAuthorizationTypes,
      projectSummaryPermitTypesHash,
    } = props;
    const transformedAuthorizationTypesHash = transformAuthorizationTypes(
      projectSummaryAuthorizationTypes
    );
    // We need to make sure we only add parent authorization type labels once to the form
    const parentHeadersAdded = [];
    return (
      <div id="authorizations-involved">
        <Typography.Title level={3}>Authorizations involved</Typography.Title>
        <p>
          These are the authorizations the proponent believes may be needed for this project.
          Additional authorizations may be required.
        </p>
        <br />
        {authorizations.length > 0 &&
          authorizations.map((a) => {
            const parentCode =
              transformedAuthorizationTypesHash[a.project_summary_authorization_type]?.parent?.code;
            const parentHeaderAdded = parentHeadersAdded.includes(parentCode);
            return (
              <>
                {!parentHeaderAdded && parentHeadersAdded.push(parentCode) ? (
                  <h2>
                    {
                      transformedAuthorizationTypesHash[a.project_summary_authorization_type]
                        ?.parent?.description
                    }
                  </h2>
                ) : null}
                <h4 className="padding-sm--bottom">
                  {
                    transformedAuthorizationTypesHash[a.project_summary_authorization_type]
                      ?.description
                  }
                </h4>
                <p className="bold padding-sm--bottom">Types of permits</p>
                {a.project_summary_permit_type.map((pt) => {
                  return <p className="padding-md--left">{projectSummaryPermitTypesHash[pt]}</p>;
                })}
                <br />
                <p className="bold padding-sm--bottom">Existing permit numbers involved</p>
                {a.existing_permits_authorizations.map((epa) => {
                  return <p className="padding-md--left">{epa}</p>;
                })}
                <br />
              </>
            );
          })}
      </div>
    );
  };

  const renderContacts = () => {
    const {
      projectSummary: { contacts },
    } = props;
    return (
      <div id="project-contacts">
        <Typography.Title level={4}>Project contacts</Typography.Title>
        <h3>Proponent contacts</h3>
        <p className="bold">Primary project contact</p>
        <p>{contacts[0]?.name}</p>
        {contacts[0]?.job_title && <p>{contacts[0]?.job_title}</p>}
        {contacts[0]?.company_name && <p>{contacts[0]?.company_name}</p>}
        <a href={`mailto: ${contacts[0]?.email}`}>{contacts[0]?.email}</a>
        <div className="inline-flex">
          <p>{contacts[0]?.phone_number}</p>
          {contacts[0]?.phone_extension && <p> ({contacts[0]?.phone_extension})</p>}
        </div>
        <br />
        {contacts.length > 1 && <p className="bold">Additional project contacts</p>}
        {contacts.length >= 1 &&
          contacts.map((contact, idx) => {
            if (!contact.is_primary) {
              return (
                <>
                  <p>{contact.name}</p>
                  {contact.job_title && <p>{contact.job_title}</p>}
                  {contact.company_name && <p>{contact.company_name}</p>}
                  <a href={`mailto: ${contact.email}`}>{contact.email}</a>
                  <div className="inline-flex">
                    <p>{contact.phone_number}</p>
                    {contact.phone_extension && <p> ({contact.phone_extension})</p>}
                  </div>
                </>
              );
            }
          })}
      </div>
    );
  };

  const renderProjectDates = () => {
    return (
      <div id="project-dates">
        <Typography.Title level={3}>Project dates requested by proponent</Typography.Title>
        <p>
          These are the key dates the proponent hopes to target. A final schedule will be negotiated
          during the pre-application review.
        </p>
        <br />
        <Row gutter={16}>
          <Col lg={12} md={24}>
            <Form.Item>
              <Field
                id="expected_draft_irt_submission_date"
                name="expected_draft_irt_submission_date"
                label="Anticipated draft IRT submission date"
                component={renderConfig.DATE}
                disabled
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="expected_permit_application_date"
                name="expected_permit_application_date"
                label="Anticipated permit application submission date"
                component={renderConfig.DATE}
                disabled
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="expected_permit_receipt_date"
                name="expected_permit_receipt_date"
                label="Desired permit issuance date"
                component={renderConfig.DATE}
                disabled
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="expected_project_start_date"
                name="expected_project_start_date"
                label="Anticipated work start date"
                component={renderConfig.DATE}
                disabled
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  };

  const renderDocuments = () => {
    const {
      projectSummary: { documents },
    } = props;
    return (
      <div id="documents">
        <Typography.Title level={4}>Documents</Typography.Title>
        <DocumentTable
          documents={documents.reduce(
            (docs, doc) => [
              {
                key: doc.mine_document_guid,
                mine_document_guid: doc.mine_document_guid,
                document_manager_guid: doc.document_manager_guid,
                name: doc.document_name,
                category:
                  props.projectSummaryDocumentTypesOptions[doc.project_summary_document_type_code],
                uploaded: doc.created_at,
              },
              ...docs,
            ],
            []
          )}
          isViewOnly
        />
      </div>
    );
  };

  return (
    <Form layout="vertical">
      {renderProjectDetails()}
      <br />
      {renderAuthorizationsInvolved()}
      <br />
      {renderProjectDates()}
      <br />
      {renderContacts()}
      <br />
      {renderDocuments()}
    </Form>
  );
};

ProjectSummaryForm.propTypes = propTypes;
ProjectSummaryForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.PROJECT_SUMMARY,
  enableReinitialize: true,
})(ProjectSummaryForm);

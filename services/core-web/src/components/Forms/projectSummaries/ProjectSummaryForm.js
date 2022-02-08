import React, { useState } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { Field, reduxForm } from "redux-form";
import { connect } from "react-redux";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Typography, Row, Col, Button, Alert } from "antd";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import * as Permission from "@/constants/permissions";
import { getDropdownProjectLeads } from "@common/selectors/partiesSelectors";
import { renderConfig } from "@/components/common/config";
import DocumentTable from "@/components/common/DocumentTable";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  projectSummary: CustomPropTypes.projectSummary.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  projectLeads: CustomPropTypes.groupOptions.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryAuthorizationTypesHash: PropTypes.objectOf(PropTypes.any).isRequired,
  projectSummaryPermitTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryStatusCodes: CustomPropTypes.options.isRequired,
};

const unassignedProjectLeadEntry = {
  label: "Unassigned",
  value: null,
};

export const ProjectSummaryForm = (props) => {
  const [isEditingProjectLead, setIsEditingProjectLead] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const projectLeadData = [unassignedProjectLeadEntry, ...props.projectLeads[0]?.opt];

  const renderProjectDetails = () => {
    const {
      projectSummary: { project_summary_lead_party_guid },
    } = props;
    return (
      <div id="project-details">
        {!project_summary_lead_party_guid && (
          <Alert
            message="This project does not have a Project Lead"
            description={
              <p>
                Please assign a Project Lead to this project via the{" "}
                <a href="#project-contacts">Project contacts</a> section.
              </p>
            }
            type="warning"
            showIcon
          />
        )}
        <br />
        <Typography.Title level={3}>Project details</Typography.Title>
        <Row gutter={16} className={isEditingStatus ? "grey-background" : ""} align="bottom">
          <Col lg={12} md={24}>
            <Form.Item>
              <Field
                id="status_code"
                name="status_code"
                label="Project Stage"
                component={renderConfig.SELECT}
                data={props.projectSummaryStatusCodes.filter(({ value }) => value !== "DFT")}
                disabled={!isEditingStatus}
              />
            </Form.Item>
          </Col>
          <AuthorizationWrapper permission={Permission.EDIT_PROJECT_SUMMARIES}>
            <Col lg={24} md={24} className="padding-sm--bottom">
              {!isEditingStatus ? (
                <Button type="secondary" onClick={() => setIsEditingStatus(true)}>
                  <img name="edit" src={EDIT_OUTLINE_VIOLET} alt="Edit" />
                  &nbsp; Edit
                </Button>
              ) : (
                <>
                  <Button
                    type="secondary"
                    loading={props.submitting}
                    onClick={() => setIsEditingStatus(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    loading={props.submitting}
                    onClick={() => {
                      props.handleSubmit("Successfully updated the project stage.");
                      setIsEditingStatus(false);
                    }}
                  >
                    Update
                  </Button>
                </>
              )}
            </Col>
          </AuthorizationWrapper>
        </Row>
        <Row gutter={16}>
          <Col lg={12} md={24}>
            <Form.Item>
              <Field
                id="proponent_project_id"
                name="proponent_project_id"
                label="Project Proponent ID"
                component={renderConfig.FIELD}
                disabled
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="project_summary_description"
                name="project_summary_description"
                label="Executive Summary"
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
      projectSummaryAuthorizationTypesHash,
      projectSummaryPermitTypesHash,
    } = props;
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
              projectSummaryAuthorizationTypesHash[a.project_summary_authorization_type]?.parent
                ?.code;
            // We need to make sure we only add parent authorization type labels once
            const parentHeaderAdded = parentHeadersAdded.includes(parentCode);
            return (
              <React.Fragment key={a.project_summary_authorization_type}>
                {!parentHeaderAdded && parentHeadersAdded.push(parentCode) ? (
                  <h2>
                    {
                      projectSummaryAuthorizationTypesHash[a.project_summary_authorization_type]
                        ?.parent?.description
                    }
                  </h2>
                ) : null}
                <h4 className="padding-sm--bottom">
                  {
                    projectSummaryAuthorizationTypesHash[a.project_summary_authorization_type]
                      ?.description
                  }
                </h4>
                <p className="bold padding-sm--bottom">Types of permits</p>
                {a.project_summary_permit_type.map((pt) => {
                  return (
                    <p
                      key={`${a.project_summary_authorization_type}-${pt}`}
                      className="padding-md--left"
                    >
                      {projectSummaryPermitTypesHash[pt]}
                    </p>
                  );
                })}
                <br />
                <p className="bold padding-sm--bottom">Existing permit numbers involved</p>
                {a.existing_permits_authorizations?.length
                  ? a.existing_permits_authorizations.map((epa) => {
                      return (
                        <p
                          key={`${a.project_summary_authorization_type}-${epa}`}
                          className="padding-md--left"
                        >
                          {epa}
                        </p>
                      );
                    })
                  : "N/A"}
                <br />
              </React.Fragment>
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
        <h3>EMLI contacts</h3>
        <Row gutter={16} className={isEditingProjectLead ? "grey-background" : ""} align="bottom">
          <Col lg={12} md={24}>
            <Form.Item>
              <Field
                id="project_summary_lead_party_guid"
                name="project_summary_lead_party_guid"
                label={<p className="bold">Project Lead</p>}
                component={renderConfig.SELECT}
                data={projectLeadData}
                disabled={!isEditingProjectLead}
              />
            </Form.Item>
          </Col>
          <AuthorizationWrapper permission={Permission.EDIT_PROJECT_SUMMARIES}>
            <Col lg={24} md={24} className="padding-sm--bottom">
              {!isEditingProjectLead ? (
                <Button type="secondary" onClick={() => setIsEditingProjectLead(true)}>
                  <img name="edit" src={EDIT_OUTLINE_VIOLET} alt="Edit" />
                  &nbsp; Edit
                </Button>
              ) : (
                <>
                  <Button
                    type="secondary"
                    loading={props.submitting}
                    onClick={() => setIsEditingProjectLead(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    loading={props.submitting}
                    onClick={() => {
                      props.handleSubmit("Successfully updated the project lead.");
                      setIsEditingProjectLead(false);
                    }}
                  >
                    Update
                  </Button>
                </>
              )}
            </Col>
          </AuthorizationWrapper>
        </Row>
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
          contacts
            .filter((c) => !c.is_primary)
            .map((contact) => {
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
                  props.projectSummaryDocumentTypesHash[doc.project_summary_document_type_code],
                uploaded: doc.upload_date,
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
    <Form layout="vertical" onSubmit={props.handleSubmit}>
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

const mapStateToProps = (state) => ({
  projectLeads: getDropdownProjectLeads(state),
});

export default compose(
  connect(mapStateToProps),
  reduxForm({
    form: FORM.PROJECT_SUMMARY,
    enableReinitialize: true,
  })
)(ProjectSummaryForm);

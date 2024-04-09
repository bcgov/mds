import React, { FC, useState } from "react";
import { compose } from "redux";
import { connect, useSelector } from "react-redux";
import { useHistory, useParams, withRouter } from "react-router-dom";
import {
  FieldArray,
  Field,
  reduxForm,
  formValueSelector,
  InjectedFormProps,
  change,
} from "redux-form";
import { Alert, Button, Row, Col, Typography, Popconfirm, Form } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  maxLength,
  phoneNumber,
  required,
  email,
  dateNotBeforeOther,
  dateNotAfterOther,
} from "@common/utils/Validate";
import {
  getDropdownProjectSummaryStatusCodes,
  getProjectSummaryDocumentTypesHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import AuthorizationsInvolved from "@mds/common/components/projectSummary/AuthorizationsInvolved";
import { getDropdownProjectLeads } from "@mds/common/redux/selectors/partiesSelectors";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { Feature, IGroupedDropdownList, IProject, IProjectSummary, USER_ROLES } from "@mds/common";
import { normalizePhone } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import * as routes from "@/constants/routes";
import { renderConfig } from "@/components/common/config";
import LinkButton from "@/components/common/buttons/LinkButton";
import { ProjectSummaryDocumentUpload } from "@/components/Forms/projectSummaries/ProjectSummaryDocumentUpload";
import ArchivedDocumentsSection from "@common/components/documents/ArchivedDocumentsSection";
import { MajorMineApplicationDocument } from "@mds/common/models/documents/document";
import ProjectLinks from "@mds/common/components/projects/ProjectLinks";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";

interface ProjectSummaryFormProps {
  project: IProject;
  initialValues: Partial<IProject>;
  onSubmit: any;
  handleSaveData: (message: string) => Promise<void>;
  removeDocument: (event, documentGuid: string) => Promise<void>;
  archivedDocuments: MajorMineApplicationDocument[];
  onArchivedDocuments: (mineGuid, projectSummaryGuid) => Promise<void>;
  isNewProject: boolean;
}

const unassignedProjectLeadEntry = {
  label: "Unassigned",
  value: null,
};

const contactFields = ({ fields, isNewProject, isEditMode }) => {
  return (
    <>
      {fields.map((field, index) => {
        return (
          <div key={field}>
            {index === 0 ? (
              <p className="bold">Primary project contact</p>
            ) : (
              <>
                <Row gutter={16}>
                  <Col span={10}>
                    <p className="bold">Additional project contact #{index}</p>
                  </Col>
                  <Col span={12}>
                    {!isNewProject && (
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
                    )}
                  </Col>
                </Row>
              </>
            )}
            <Row gutter={16}>
              <Col span={18}>
                <Row gutter={16}>
                  <Col md={12} sm={24}>
                    <Field
                      name={`${field}.first_name`}
                      id={`${field}.first_name`}
                      label="First Name"
                      component={renderConfig.FIELD}
                      validate={[required]}
                      disabled={!isNewProject && !isEditMode}
                    />
                  </Col>
                  <Col md={12} sm={24}>
                    <Field
                      name={`${field}.last_name`}
                      id={`${field}.last_name`}
                      label="Last Name"
                      component={renderConfig.FIELD}
                      validate={[required]}
                      disabled={!isNewProject && !isEditMode}
                    />
                  </Col>
                </Row>

                <Field
                  name={`${field}.job_title`}
                  id={`${field}.job_title`}
                  label="Job Title (optional)"
                  component={renderConfig.FIELD}
                  disabled={!isNewProject && !isEditMode}
                />
                <Field
                  name={`${field}.company_name`}
                  id={`${field}.company_name`}
                  label="Company name (optional)"
                  component={renderConfig.FIELD}
                  disabled={!isNewProject && !isEditMode}
                />
                <Field
                  name={`${field}.email`}
                  id={`${field}.email`}
                  label="Email"
                  component={renderConfig.FIELD}
                  validate={[required, email]}
                  disabled={!isNewProject && !isEditMode}
                />
                <Row gutter={16}>
                  <Col span={20}>
                    <Field
                      name={`${field}.phone_number`}
                      id={`${field}.phone_number`}
                      label="Phone Number"
                      component={renderConfig.FIELD}
                      validate={[phoneNumber, maxLength(12), required]}
                      normalize={normalizePhone}
                      disabled={!isNewProject && !isEditMode}
                    />
                  </Col>
                  <Col span={4}>
                    <Field
                      name={`${field}.phone_extension`}
                      id={`${field}.phone_extension`}
                      label="Ext. (optional)"
                      component={renderConfig.FIELD}
                      validate={[maxLength(6)]}
                      disabled={!isNewProject && !isEditMode}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            {index === 0 && <p className="bold">Additional project contacts (optional)</p>}
          </div>
        );
      })}
      {(isNewProject || isEditMode) && (
        <LinkButton
          onClick={() => {
            fields.push({ is_primary: false });
          }}
          title="Add additional project contacts"
        >
          <PlusOutlined /> Add additional project contacts
        </LinkButton>
      )}
    </>
  );
};

const ProjectSummaryForm: FC<InjectedFormProps<IProjectSummary> & ProjectSummaryFormProps> = (
  props
) => {
  const { isFeatureEnabled } = useFeatureFlag();
  const majorProjectsFeatureEnabled = isFeatureEnabled(Feature.MAJOR_PROJECT_LINK_PROJECTS);
  const [isEditMode, setIsEditMode] = useState(false);
  const projectLeads: IGroupedDropdownList = useSelector(getDropdownProjectLeads);
  const userRoles: string[] = useSelector(getUserAccessData);
  const formSelector = formValueSelector(FORM.ADD_EDIT_PROJECT_SUMMARY);
  const expected_draft_irt_submission_date = useSelector((state) =>
    formSelector(state, "expected_draft_irt_submission_date")
  );
  const expected_permit_application_date = useSelector((state) =>
    formSelector(state, "expected_permit_application_date")
  );
  const expected_permit_receipt_date = useSelector((state) =>
    formSelector(state, "expected_permit_receipt_date")
  );
  const documents = useSelector((state) => formSelector(state, "documents"));

  const projectSummaryStatusCodes = useSelector(getDropdownProjectSummaryStatusCodes);
  const projectSummaryDocumentTypesHash = useSelector(getProjectSummaryDocumentTypesHash);

  const projectLeadData = [unassignedProjectLeadEntry, ...projectLeads[0]?.opt];
  const { mineGuid } = useParams<{ mineGuid: string }>();
  const history = useHistory();

  const renderProjectDetails = () => {
    const {
      project: { project_lead_party_guid },
    } = props;
    return (
      <div id="project-details">
        {!props.isNewProject && !project_lead_party_guid && (
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

        <div>
          <Typography.Title level={3}>Project details</Typography.Title>
        </div>

        {props.initialValues?.status_code && (
          <Row gutter={16} className={isEditMode ? "grey-background" : ""} align="bottom">
            <Col lg={12} md={24}>
              <Field
                id="status_code"
                name="status_code"
                label="Project Stage"
                component={renderConfig.SELECT}
                data={projectSummaryStatusCodes.filter(({ value }) => value !== "DFT")}
                disabled={!isEditMode}
              />
            </Col>
          </Row>
        )}
        <Row gutter={16}>
          <Col lg={12} md={24}>
            <Field
              id="project_summary_title"
              name="project_summary_title"
              label="Project title"
              component={renderConfig.FIELD}
              validate={[maxLength(300), required]}
              disabled={!props.isNewProject && !isEditMode}
            />
            <Field
              id="proponent_project_id"
              name="proponent_project_id"
              label={
                <>
                  Proponent project tracking ID (optional)
                  <br />
                  <span className="light--sm">
                    If your company uses a tracking number to identify projects, please provide it
                    here.
                  </span>
                </>
              }
              component={renderConfig.FIELD}
              validate={[maxLength(20)]}
              disabled={!props.isNewProject && !isEditMode}
            />
            <Field
              id="project_summary_description"
              name="project_summary_description"
              label={
                <>
                  Project Overview
                  <br />
                  <span className="light--sm">
                    Provide a 2-3 paragraph high-level description of your proposed project.
                  </span>
                </>
              }
              component={renderConfig.AUTO_SIZE_FIELD}
              minRows={10}
              validate={[maxLength(4000), required]}
              disabled={!props.isNewProject && !isEditMode}
            />
          </Col>
          {majorProjectsFeatureEnabled && (
            <Col>
              <ProjectLinks
                tableOnly={!props.isNewProject && !isEditMode}
                viewProject={(p) =>
                  routes.PRE_APPLICATIONS.dynamicRoute(p.project_guid, p.project_summary_guid)
                }
              />
            </Col>
          )}
        </Row>
      </div>
    );
  };

  const renderContacts = () => {
    return (
      <div id="project-contacts">
        <Typography.Title level={4}>Project contacts</Typography.Title>
        <h3>EMLI contacts</h3>
        <Row gutter={16}>
          <Col lg={12} md={24}>
            <Field
              id="project_lead_party_guid"
              name="project_lead_party_guid"
              label={<p className="bold">Project Lead</p>}
              component={renderConfig.SELECT}
              data={projectLeadData}
              disabled={!props.isNewProject && !isEditMode}
            />
          </Col>
        </Row>
        <h3>Proponent contacts</h3>
        <>
          <FieldArray
            name="contacts"
            component={contactFields}
            rerenderOnEveryChange
            {...{
              isNewProject: props.isNewProject,
              isEditMode: isEditMode,
            }}
          />
        </>
      </div>
    );
  };

  const renderProjectDates = () => {
    return (
      <div id="project-dates">
        <Typography.Title level={3}>Project dates</Typography.Title>
        <Alert
          message=""
          description="These dates are for guidance and planning purposes only and do not reflect actual delivery dates. The Major Mines Office will work with you on a more definitive schedule."
          type="warning"
          showIcon
        />
        <br />
        <Row gutter={16}>
          <Col lg={12} md={24}>
            <Field
              id="expected_draft_irt_submission_date"
              name="expected_draft_irt_submission_date"
              label="When do you anticipate submitting a draft Information Requirements Table? (optional)"
              placeholder="Please select date"
              component={renderConfig.DATE}
              validate={[dateNotAfterOther(expected_permit_application_date)]}
              disabled={!props.isNewProject && !isEditMode}
            />
            <Field
              id="expected_permit_application_date"
              name="expected_permit_application_date"
              label="When do you anticipate submitting a permit application? (optional)"
              placeholder="Please select date"
              component={renderConfig.DATE}
              validate={[dateNotBeforeOther(expected_draft_irt_submission_date)]}
              disabled={!props.isNewProject && !isEditMode}
            />
            <Field
              id="expected_permit_receipt_date"
              name="expected_permit_receipt_date"
              label="When do you hope to receive your permit/amendment(s)? (optional)"
              placeholder="Please select date"
              component={renderConfig.DATE}
              validate={[dateNotBeforeOther(expected_permit_application_date)]}
              disabled={!props.isNewProject && !isEditMode}
            />
            <Field
              id="expected_project_start_date"
              name="expected_project_start_date"
              label="When do you anticipate starting work on this project? (optional)"
              placeholder="Please select date"
              component={renderConfig.DATE}
              validate={[dateNotBeforeOther(expected_permit_receipt_date)]}
              disabled={!props.isNewProject && !isEditMode}
            />
          </Col>
        </Row>
      </div>
    );
  };

  const renderDocuments = () => {
    const canRemoveDocuments =
      userRoles.includes(USER_ROLES.role_admin) ||
      userRoles.includes(USER_ROLES.role_edit_project_summaries);
    return (
      <div id="document-details">
        <ProjectSummaryDocumentUpload
          initialValues={props.initialValues}
          removeDocument={props.removeDocument}
          canRemoveDocuments={canRemoveDocuments}
          canArchiveDocuments={canRemoveDocuments}
          onArchivedDocuments={props.onArchivedDocuments}
          projectSummaryDocumentTypesHash={projectSummaryDocumentTypesHash}
          mineGuid={mineGuid ?? props?.project?.mine_guid}
          isNewProject={props.isNewProject}
          isEditMode={isEditMode}
          documents={documents}
          change={props.change}
        />
      </div>
    );
  };

  const renderArchivedDocuments = () => {
    return <ArchivedDocumentsSection documents={props.archivedDocuments} />;
  };

  const cancelEdit = () => {
    props.reset();
    setIsEditMode(false);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  return (
    <Form
      layout="vertical"
      onFinish={(_values) => {
        const message = props.isNewProject
          ? "Successfully submitted a project description to the Province of British Columbia."
          : "Successfully updated the project.";
        props.handleSaveData(message);
      }}
    >
      <div className="right center-mobile">
        {!props.isNewProject && !isEditMode && (
          <>
            <Button
              id="project-summary-submit"
              className="full-mobile"
              type="primary"
              onClick={() => {
                toggleEditMode();
              }}
            >
              Edit Project Description
            </Button>
          </>
        )}
        {(props.isNewProject || isEditMode) && (
          <>
            <Popconfirm
              placement="topLeft"
              title="Are you sure you want to leave this page? All unsaved changes will be lost."
              onConfirm={() => {
                if (props.isNewProject) {
                  const url = routes.MINE_PRE_APPLICATIONS.dynamicRoute(mineGuid);
                  history.push(url);
                } else if (isEditMode) {
                  cancelEdit();
                }
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button className="full-mobile" type="default">
                Cancel
              </Button>
            </Popconfirm>
            <Button
              data-cy="project-summary-submit-button"
              id="project-summary-submit"
              className="full-mobile"
              type="primary"
              htmlType="submit"
              loading={props.submitting}
              disabled={props.submitting}
            >
              Save Changes
            </Button>
          </>
        )}
      </div>
      {renderProjectDetails()}
      <br />
      <AuthorizationsInvolved />
      <br />
      {renderProjectDates()}
      <br />
      {renderContacts()}
      <br />
      {renderDocuments()}
      <br />
      {renderArchivedDocuments()}
      <div className="right center-mobile">
        {(props.isNewProject || isEditMode) && (
          <>
            <Popconfirm
              placement="topLeft"
              title="Are you sure you want to leave this page? All Unsaved changes will be lost."
              onConfirm={() => {
                if (props.isNewProject) {
                  const url = routes.MINE_PRE_APPLICATIONS.dynamicRoute(mineGuid);
                  history.push(url);
                } else if (isEditMode) {
                  cancelEdit();
                }
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button className="full-mobile" type="default">
                Cancel
              </Button>
            </Popconfirm>
            <Button
              id="project-summary-submit"
              className="full-mobile"
              type="primary"
              htmlType="submit"
              loading={props.submitting}
              disabled={props.submitting}
            >
              Save Changes
            </Button>
          </>
        )}
      </div>
    </Form>
  );
};

const mapDispatchToProps = {
  change,
};

export default (compose(
  withRouter,
  connect(null, mapDispatchToProps),
  reduxForm({
    form: FORM.ADD_EDIT_PROJECT_SUMMARY,
    enableReinitialize: true,
    touchOnBlur: true,
    touchOnChange: false,
  })
)(ProjectSummaryForm) as any) as FC<ProjectSummaryFormProps>;

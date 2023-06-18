import React, { useState } from "react";
import PropTypes from "prop-types";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  arrayPush,
  change,
  FieldArray,
  Field,
  reduxForm,
  formValueSelector,
  getFormValues,
  getFormSyncErrors,
  FormSection,
} from "redux-form";
import { Alert, Button, Row, Col, Checkbox, Typography, Popconfirm } from "antd";
import { DeleteOutlined, PlusOutlined, DownOutlined } from "@ant-design/icons";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import {
  maxLength,
  phoneNumber,
  required,
  email,
  dateNotBeforeOther,
  dateNotAfterOther,
  requiredRadioButton,
} from "@common/utils/Validate";
import {
  getTransformedProjectSummaryAuthorizationTypes,
  getDropdownProjectSummaryPermitTypes,
} from "@common/selectors/staticContentSelectors";
import { getDropdownProjectLeads } from "@common/selectors/partiesSelectors";
import { getUserAccessData } from "@common/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common";
import { getFormattedProjectSummary } from "@common/selectors/projectSelectors";
import { normalizePhone } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import * as routes from "@/constants/routes";
import { renderConfig } from "@/components/common/config";
import LinkButton from "@/components/common/buttons/LinkButton";
import { ProjectSummaryDocumentUpload } from "@/components/Forms/projectSummaries/ProjectSummaryDocumentUpload";
import DocumentTable from "@/components/common/DocumentTable";

const propTypes = {
  projectSummary: CustomPropTypes.projectSummary.isRequired,
  project: CustomPropTypes.project.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  projectLeads: CustomPropTypes.groupOptions.isRequired,
  handleSaveData: PropTypes.func.isRequired,
  handleUpdateData: PropTypes.func.isRequired,
  removeDocument: PropTypes.func.isRequired,
  archivedDocuments: PropTypes.arrayOf(CustomPropTypes.mineDocument),
  onArchivedDocuments: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  change: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  isNewProject: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  toggleEditMode: PropTypes.func.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryAuthorizationTypesHash: PropTypes.objectOf(PropTypes.any).isRequired,
  projectSummaryPermitTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryStatusCodes: CustomPropTypes.options.isRequired,
  transformedProjectSummaryAuthorizationTypes: PropTypes.arrayOf(
    PropTypes.objectOf(PropTypes.string)
  ).isRequired,
  formValues: PropTypes.objectOf(PropTypes.string),
  formErrors: PropTypes.objectOf(PropTypes.string),
  formattedProjectSummary: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
  ).isRequired,
  expected_permit_application_date: PropTypes.string,
  expected_draft_irt_submission_date: PropTypes.string,
  expected_permit_receipt_date: PropTypes.string,
  match: PropTypes.shape({
    params: {
      mineGuid: PropTypes.string,
    },
  }).isRequired,
  reset: PropTypes.func.isRequired,
};

const defaultProps = {
  formValues: {},
  formErrors: {},
  expected_permit_application_date: undefined,
  expected_draft_irt_submission_date: undefined,
  expected_permit_receipt_date: undefined,
};

const unassignedProjectLeadEntry = {
  label: "Unassigned",
  value: null,
};

const contactFields = ({ fields, isNewProject, isEditMode }) => {
  return (
    <>
      {fields.map((field, index) => {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index}>
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
                <Field
                  name={`${field}.name`}
                  id={`${field}.name`}
                  label="Name"
                  component={renderConfig.FIELD}
                  validate={[required]}
                  disabled={!isNewProject && !isEditMode}
                />
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
          disabled={!isNewProject && !isEditMode}
        >
          <PlusOutlined /> Add additional project contacts
        </LinkButton>
      )}
    </>
  );
};

const setInitialValues = (authorizationType, formValues) => {
  const currentAuthorizationType = formValues?.authorizations?.find(
    (val) => val?.project_summary_authorization_type === authorizationType
  );
  return currentAuthorizationType?.project_summary_permit_type ?? [];
};

const renderNestedFields = (code, props) => {
  return (
    <div>
      {code !== "OTHER" && (
        <>
          <Field
            id="project_summary_permit_type"
            name="project_summary_permit_type"
            fieldName={`${code}.project_summary_permit_type`}
            options={props.dropdownProjectSummaryPermitTypes}
            formName={FORM.ADD_EDIT_PROJECT_SUMMARY}
            formValues={props.formattedProjectSummary}
            change={props.change}
            component={renderConfig.GROUP_CHECK_BOX}
            label={
              <>
                <p>What type of permit is involved in your application?</p>
              </>
            }
            setInitialValues={() => setInitialValues(code, props.formattedProjectSummary)}
            disabled={!props.isNewProject && !props.isEditMode}
          />
        </>
      )}
      <Field
        id={`${code}.existing_permits_authorizations`}
        name="existing_permits_authorizations"
        label={
          <>
            <p>
              If your application involved a change to an existing permit, please list the numbers
              of the permits involved.
            </p>
            <span className="light--sm">Please separate each permit number with a comma</span>
          </>
        }
        component={renderConfig.FIELD}
      />
    </div>
  );
};

export const ProjectSummaryForm = (props) => {
  const projectLeadData = [unassignedProjectLeadEntry, ...props.projectLeads[0]?.opt];
  const [checked, setChecked] = useState(
    props.formattedProjectSummary ? props.formattedProjectSummary.authorizationOptions : []
  );

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
          <Row gutter={16} className={props.isEditMode ? "grey-background" : ""} align="bottom">
            <Col lg={12} md={24}>
              <Form.Item>
                <Field
                  id="status_code"
                  name="status_code"
                  label="Project Stage"
                  component={renderConfig.SELECT}
                  data={props.projectSummaryStatusCodes.filter(({ value }) => value !== "DFT")}
                  disabled={!props.isEditMode}
                />
              </Form.Item>
            </Col>
          </Row>
        )}
        <Row gutter={16}>
          <Col lg={12} md={24}>
            <Form.Item>
              <Field
                id="project_summary_title"
                name="project_summary_title"
                label="Project title"
                component={renderConfig.FIELD}
                validate={[maxLength(300), required]}
                disabled={!props.isNewProject && !props.isEditMode}
              />
            </Form.Item>
            <Form.Item>
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
                disabled={!props.isNewProject && !props.isEditMode}
              />
            </Form.Item>
            <Form.Item>
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
                disabled={!props.isNewProject && !props.isEditMode}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  };

  const handleChange = (e, code) => {
    if (e.target.checked) {
      setChecked((arr) => [code, ...arr]);
    } else {
      setChecked(checked.filter((item) => item !== code));
      props.change(FORM.ADD_EDIT_PROJECT_SUMMARY, code, null);
    }
  };

  const renderAuthorizationsInvolved = () => {
    return (
      <div id="authorizations-involved">
        <Typography.Title level={3}>
          Authorizations potentially involved in the project
        </Typography.Title>
        <Alert
          message=""
          description="Please select the permits and authorizations that you anticipate needing for this project, based on your current understanding. This is to assist in planning and may not be complete list for the final application."
          type="warning"
          showIcon
        />
        <br />
        <Typography.Title level={3}>Mines Review Committee</Typography.Title>
        <Field
          id="mrc_review_required"
          name="mrc_review_required"
          fieldName="mrc_review_required"
          formName={FORM.ADD_EDIT_PROJECT_SUMMARY}
          label={
            <>
              <p>
                <b>
                  Does your project require a coordinated review by a Mine Review Committee, under
                  Section 9 of the Mines Act?
                </b>
                <br />
                This response will be reviewed by the Major Mines Office and confirmed by the Chief
                Permitting Officer.
              </p>
            </>
          }
          component={renderConfig.RADIO}
          validate={[requiredRadioButton]}
          disabled={!props.isNewProject && !props.isEditMode}
        />
        <br />
        {props.transformedProjectSummaryAuthorizationTypes?.map((a) => {
          return (
            <React.Fragment key={a.code}>
              <h2>{a.description}</h2>
              <h4 className="padding-sm--bottom">
                {a.children?.map((child) => {
                  return (
                    <FormSection name={child.code} key={`${a}.${child.code}`}>
                      <Checkbox
                        key={child.code}
                        value={child.code}
                        onChange={(e) => handleChange(e, child.code)}
                        checked={checked.includes(child.code)}
                        disabled={!props.isNewProject && !props.isEditMode}
                      >
                        {checked.includes(child.code) ? (
                          <>
                            {child.description} <DownOutlined />
                          </>
                        ) : (
                          child.description
                        )}
                      </Checkbox>
                      {checked.includes(child.code) && renderNestedFields(child.code, props)}
                    </FormSection>
                  );
                })}
              </h4>
              <br />
            </React.Fragment>
          );
        })}
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
            <Form.Item>
              <Field
                id="project_lead_party_guid"
                name="project_lead_party_guid"
                label={<p className="bold">Project Lead</p>}
                component={renderConfig.SELECT}
                data={projectLeadData}
                disabled={!props.isNewProject && !props.isEditMode}
              />
            </Form.Item>
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
              isEditMode: props.isEditMode,
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
            <Form.Item>
              <Field
                id="expected_draft_irt_submission_date"
                name="expected_draft_irt_submission_date"
                label="When do you anticipate submitting a draft Information Requirements Table? (optional)"
                placeholder="Please select date"
                component={renderConfig.DATE}
                validate={[dateNotAfterOther(props.expected_permit_application_date)]}
                disabled={!props.isNewProject && !props.isEditMode}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="expected_permit_application_date"
                name="expected_permit_application_date"
                label="When do you anticipate submitting a permit application? (optional)"
                placeholder="Please select date"
                component={renderConfig.DATE}
                validate={[dateNotBeforeOther(props.expected_draft_irt_submission_date)]}
                disabled={!props.isNewProject && !props.isEditMode}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="expected_permit_receipt_date"
                name="expected_permit_receipt_date"
                label="When do you hope to receive your permit/amendment(s)? (optional)"
                placeholder="Please select date"
                component={renderConfig.DATE}
                validate={[dateNotBeforeOther(props.expected_permit_application_date)]}
                disabled={!props.isNewProject && !props.isEditMode}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="expected_project_start_date"
                name="expected_project_start_date"
                label="When do you anticipate starting work on this project? (optional)"
                placeholder="Please select date"
                component={renderConfig.DATE}
                validate={[dateNotBeforeOther(props.expected_permit_receipt_date)]}
                disabled={!props.isNewProject && !props.isEditMode}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  };

  const renderDocuments = () => {
    const canRemoveDocuments =
      props.userRoles.includes(USER_ROLES.role_admin) ||
      props.userRoles.includes(USER_ROLES.role_edit_project_summaries);
    return (
      <div id="document-details">
        <ProjectSummaryDocumentUpload
          initialValues={props.initialValues}
          canRemoveDocuments={canRemoveDocuments}
          canArchiveDocuments={canRemoveDocuments}
          mineGuid={
            props.match?.params?.mineGuid
              ? props.match?.params?.mineGuid
              : props?.project?.mine_guid
          }
          {...props}
        />
      </div>
    );
  };

  const renderArchivedDocuments = () => {
    const docs = props.archivedDocuments.map((d) => {
      d.name = d.document_name;

      return d;
    });

    return (
      <div id="archived-documents">
        <Typography.Title level={4}>Archived Documents</Typography.Title>
        <DocumentTable documents={docs}></DocumentTable>
      </div>
    );
  };

  const cancelEdit = () => {
    props.reset(FORM.ADD_EDIT_PROJECT_SUMMARY);
    props.toggleEditMode();
  };

  return (
    <Form
      layout="vertical"
      onSubmit={(e) => {
        props.handleSaveData(
          e,
          props.isNewProject
            ? "Successfully submitted a project description to the Province of British Columbia."
            : "Successfully updated the project."
        );
      }}
    >
      <div className="right center-mobile">
        {!props.isNewProject && !props.isEditMode && (
          <>
            <Button
              id="project-summary-submit"
              className="full-mobile"
              type="primary"
              onClick={() => {
                props.toggleEditMode();
              }}
            >
              Edit Project Description
            </Button>
          </>
        )}
        {(props.isNewProject || props.isEditMode) && (
          <>
            <Popconfirm
              placement="topLeft"
              title="Are you sure you want to leave this page? All unsaved changes will be lost."
              onConfirm={() => {
                if (props.isNewProject) {
                  const url = routes.MINE_PRE_APPLICATIONS.dynamicRoute(
                    props.match?.params?.mineGuid
                  );
                  props.history.push(url);
                } else if (props.isEditMode) {
                  cancelEdit();
                }
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button className="full-mobile" type="secondary">
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
      {renderProjectDetails()}
      <br />
      {renderAuthorizationsInvolved()}
      <br />
      {renderProjectDates()}
      <br />
      {renderContacts()}
      <br />
      {renderDocuments()}
      <br />
      {renderArchivedDocuments()}
      <div className="right center-mobile">
        {(props.isNewProject || props.isEditMode) && (
          <>
            <Popconfirm
              placement="topLeft"
              title="Are you sure you want to leave this page? All Unsaved changes will be lost."
              onConfirm={() => {
                if (props.isNewProject) {
                  const url = routes.MINE_PRE_APPLICATIONS.dynamicRoute(
                    props.match?.params?.mineGuid
                  );
                  props.history.push(url);
                } else if (props.isEditMode) {
                  cancelEdit();
                }
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button className="full-mobile" type="secondary">
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

ProjectSummaryForm.propTypes = propTypes;
ProjectSummaryForm.defaultProps = defaultProps;

const selector = formValueSelector(FORM.ADD_EDIT_PROJECT_SUMMARY);

const mapStateToProps = (state) => ({
  projectLeads: getDropdownProjectLeads(state),
  userRoles: getUserAccessData(state),
  contacts: selector(state, "contacts") || [],
  expected_draft_irt_submission_date: selector(state, "expected_draft_irt_submission_date"),
  expected_permit_application_date: selector(state, "expected_permit_application_date"),
  expected_permit_receipt_date: selector(state, "expected_permit_receipt_date"),
  documents: selector(state, "documents"),
  formValues: getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY)(state) || {},
  formErrors: getFormSyncErrors(FORM.ADD_EDIT_PROJECT_SUMMARY)(state),
  anyTouched: selector(state, "anyTouched"),
  transformedProjectSummaryAuthorizationTypes: getTransformedProjectSummaryAuthorizationTypes(
    state
  ),
  dropdownProjectSummaryPermitTypes: getDropdownProjectSummaryPermitTypes(state),
  formattedProjectSummary: getFormattedProjectSummary(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      arrayPush,
      change,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.ADD_EDIT_PROJECT_SUMMARY,
    enableReinitialize: true,
    touchOnBlur: true,
    touchOnChange: false,
  })
)(withRouter(ProjectSummaryForm));

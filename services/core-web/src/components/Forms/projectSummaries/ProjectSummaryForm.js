import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  arrayPush,
  change,
  Field,
  reduxForm,
  formValueSelector,
  getFormValues,
  getFormSyncErrors,
  FormSection,
} from "redux-form";
import { Alert, Button, Row, Col, Checkbox, Typography, Popconfirm } from "antd";
import { DeleteOutlined, PlusOutlined, DownOutlined, ContactsFilled } from "@ant-design/icons";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { isNil } from "lodash";
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
import { USER_ROLES } from "@common/constants/environment";
import { getFormattedProjectSummary } from "@common/selectors/projectSelectors";
import { resetForm, normalizePhone } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import * as Permission from "@/constants/permissions";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import { renderConfig } from "@/components/common/config";
import DocumentTable from "@/components/common/DocumentTable";
import LinkButton from "@/components/common/buttons/LinkButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { ProjectSummaryDocumentUpload } from "@/components/Forms/projectSummaries/ProjectSummaryDocumentUpload";
import { EDIT_PARTY } from "@/constants/modalContent";

const propTypes = {
  projectSummary: CustomPropTypes.projectSummary.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  projectLeads: CustomPropTypes.groupOptions.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  removeDocument: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryAuthorizationTypesHash: PropTypes.objectOf(PropTypes.any).isRequired,
  projectSummaryPermitTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryStatusCodes: CustomPropTypes.options.isRequired,
};

const defaultProps = {
  documents: [],
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

export const ProjectSummaryForm = (props) => {
  const [isEditingProjectLead, setIsEditingProjectLead] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const projectLeadData = [unassignedProjectLeadEntry, ...props.projectLeads[0]?.opt];
  const [checked, setChecked] = useState(
    props.formattedProjectSummary ? props.formattedProjectSummary.authorizationOptions : []
  );

  // useEffect(() => {
  //   if (isNil(props.contacts) || props.contacts.length === 0) {
  //     props.arrayPush(FORM.ADD_EDIT_PROJECT_SUMMARY, "contacts", { is_primary: true });
  //   }
  // }, []);

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
        {isEditingStatus && props.initialValues?.status_code && (
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
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="project_summary_description"
                name="project_summary_description"
                label="Executive Summary"
                component={renderConfig.AUTO_SIZE_FIELD}
                minRows={10}
                validate={[maxLength(4000), required]}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  };

  const setInitialValues = (authorizationType, formValues) => {
    console.log("authorizationType", authorizationType);
    const currentAuthorizationType = formValues?.authorizations?.find(
      (val) => val?.project_summary_authorization_type === authorizationType
    );
    return currentAuthorizationType?.project_summary_permit_type ?? [];
  };

  const renderNestedFields = (code) => {
    console.log("code-renderNestedFields: ", code.project_summary_permit_type);
    return (
      <div className="nested-container">
        {code !== "OTHER" && (
          <>
            <Field
              id="project_summary_permit_type"
              name="project_summary_permit_type"
              options={props.dropdownProjectSummaryPermitTypes}
              formName={FORM.ADD_EDIT_PROJECT_SUMMARY}
              formValues={props.formattedProjectSummary}
              change={props.change}
              component={renderConfig.GROUP_CHECK_BOX}
              label="What type of permit is involved in your application?"
            />
          </>
        )}
        <Field
          id={`${code}.existing_permits_authorizations`}
          name="existing_permits_authorizations"
          label={
            <>
              If your application involved a change to an existing permit, please list the numbers
              of the permits involved.
              <br />
              <span className="light--sm">Please separate each permit number with a comma</span>
            </>
          }
          component={renderConfig.FIELD}
        />
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
    const {
      initialValues: { authorizations },
      projectSummaryAuthorizationTypesHash,
      projectSummaryPermitTypesHash,
    } = props;
    const parentHeadersAdded = [];
    return (
      <div id="authorizations-involved">
        <Typography.Title level={3}>Authorizations Involved</Typography.Title>
        <p>
          These are the authorizations the proponent believes may be needed for this project.
          Additional authorizations may be required.
        </p>
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
                </b>{" "}
                This response will be reviewed by the Major Mines Office and confirmed by the Chief
                Permitting Officer.
              </p>
            </>
          }
          component={renderConfig.RADIO}
          validate={[requiredRadioButton]}
        />
        <br />
        {props.transformedProjectSummaryAuthorizationTypes?.map((a) => {
          console.log("a.description", a.description);
          return (
            <React.Fragment key={a.code}>
              <h2>{a.description}</h2>
              <h4 className="padding-sm--bottom">
                {a.children?.map((child) => {
                  console.log("child.description", child.description);
                  return (
                    <FormSection name={child.code} key={`${a}.${child.code}`}>
                      <Checkbox
                        key={child.code}
                        value={child.code}
                        onChange={(e) => handleChange(e, child.code)}
                        checked={checked.includes(child.code)}
                      >
                        {checked.includes(child.code) ? (
                          <>
                            {child.description} <DownOutlined />
                          </>
                        ) : (
                          child.description
                        )}
                      </Checkbox>
                      {checked.includes(child.code) && renderNestedFields(child.code)}
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
    const contacts = [...props.initialValues.contacts];
    props.change("contacts", contacts);
    // const contacts = props.contacts;
    return (
      <div id="project-contacts">
        <Typography.Title level={4}>Project contacts</Typography.Title>
        <h3>EMLI contacts</h3>
        {/* <Row gutter={16} className={isEditingProjectLead ? "grey-background" : ""} align="bottom">
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
        </Row> */}
        <h3>Proponent contacts</h3>
        <>
          <p className="bold">Primary project contact</p>
          <Row gutter={16}>
            <Col lg={12} md={24}>
              <Form.Item>
                <Field
                  name={"contacts[0].name"}
                  id={"contacts[0].name"}
                  label="Name"
                  component={renderConfig.FIELD}
                  validate={[required]}
                />
              </Form.Item>
              <Form.Item>
                <Field
                  name={`${contacts[0]}.job_title`}
                  id={`${contacts[0]}.job_title`}
                  label="Job Title (optional)"
                  component={renderConfig.FIELD}
                />
              </Form.Item>
              <Field
                name={`${contacts[0]}.company_name`}
                id={`${contacts[0]}.company_name`}
                label="Company name (optional)"
                component={renderConfig.FIELD}
              />
              <Field
                name={"contacts[0].email"}
                id={"contacts[0].email"}
                label="Email"
                component={renderConfig.FIELD}
                validate={[required, email]}
              />
              <Row gutter={16}>
                <Col span={20}>
                  <Field
                    name={"contacts[0].phone_number"}
                    id={"contacts[0].phone_number"}
                    label="Phone Number"
                    component={renderConfig.FIELD}
                    validate={[phoneNumber, maxLength(12), required]}
                    normalize={normalizePhone}
                  />
                </Col>
                <Col span={4}>
                  <Field
                    name={`${contacts[0]}.phone_extension`}
                    id={`${contacts[0]}.phone_extension`}
                    label="Ext. (optional)"
                    component={renderConfig.FIELD}
                    validate={[maxLength(6)]}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <br />
          {contacts.length > 1 && <p className="bold">Additional project contacts</p>}
          {contacts.length >= 1 &&
            contacts
              // .filter((c) => !c.is_primary)
              .map((contact, i) => {
                return (
                  <>
                    {!contact.is_primary && (
                      <>
                        <Row gutter={16}>
                          <Col span={10}>
                            <Typography.Title level={5}>
                              Additional project contact #{i}
                            </Typography.Title>
                          </Col>
                          <Col span={12}>
                            <Popconfirm
                              placement="topLeft"
                              title="Are you sure you want to remove this contact?"
                              onConfirm={() => contact.remove(i)}
                              okText="Remove"
                              cancelText="Cancel"
                            >
                              <Button type="primary" size="small" ghost>
                                <DeleteOutlined className="padding-sm--left icon-sm" />
                              </Button>
                            </Popconfirm>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col lg={12} md={24}>
                            <Field
                              name={contact.name}
                              id={contact.name}
                              label="Name"
                              component={renderConfig.FIELD}
                              validate={[required]}
                            />
                            <Field
                              name={contact.job_title}
                              id={contact.job_title}
                              label="Job Title (optional)"
                              component={renderConfig.FIELD}
                            />
                            <Field
                              name={contact.company_name}
                              id={contact.company_name}
                              label="Company name (optional)"
                              component={renderConfig.FIELD}
                            />
                            <Field
                              name={contact.email}
                              id={contact.email}
                              label="Email"
                              component={renderConfig.FIELD}
                              validate={[required, email]}
                            />
                            <Row gutter={16}>
                              <Col span={20}>
                                <Field
                                  name={contact.phone_number}
                                  id={contact.phone_number}
                                  label="Phone Number"
                                  component={renderConfig.FIELD}
                                  validate={[maxLength(12), required]}
                                />
                              </Col>
                              <Col span={4}>
                                <Field
                                  name={contact.phone_extension}
                                  id={contact.phone_extension}
                                  label="Ext. (optional)"
                                  component={renderConfig.FIELD}
                                  validate={[maxLength(6)]}
                                />
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </>
                    )}
                  </>
                );
              })}
          <LinkButton
            onClick={() => {
              contacts.push({ is_primary: false });
              props.change("contacts", contacts);
            }}
            title="Add additional project contacts"
          >
            <PlusOutlined /> Add additional project contacts
          </LinkButton>
        </>
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
                label="When do you anticipate submitting a draft Information Requirements Table? (optional)"
                placeholder="Please select date"
                component={renderConfig.DATE}
                validate={[dateNotAfterOther(props.expected_permit_application_date)]}
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
    const canRemoveDocuments =
      props.userRoles.includes(USER_ROLES.role_admin) ||
      props.userRoles.includes(USER_ROLES.role_edit_project_summaries);
    return (
      <div id="documents">
        <ProjectSummaryDocumentUpload
          initialValues={props.initialValues}
          {...documents}
          {...canRemoveDocuments}
          {...props}
        />
      </div>
    );
  };

  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      {renderProjectDetails()}
      <br />
      {/* {renderAuthorizationsInvolved()} */}
      <br />
      {/* {renderProjectDates()} */}
      <br />
      {renderContacts()}
      <br />
      {renderDocuments()}
      <div className="right center-mobile">
        <Button
          id="project-summary-submit"
          className="full-mobile"
          type="primary"
          htmlType="submit"
          loading={props.submitting}
        >
          Create
        </Button>
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
  contacts: selector(state, "contacts"),
  code: selector(state, "code"),
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
    touchOnBlur: false,
  })
)(withRouter(ProjectSummaryForm));

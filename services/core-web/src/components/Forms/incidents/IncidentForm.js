import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { bindActionCreators, compose } from "redux";
import { connect, useSelector } from "react-redux";
import { Field, FieldArray, reduxForm, change, getFormValues, formValueSelector } from "redux-form";
import { LockOutlined, PlusOutlined } from "@ant-design/icons";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row, Typography, Divider, Empty, Button, Alert } from "antd";
import {
  required,
  requiredList,
  maxLength,
  email,
  phoneNumber,
  number,
  dateNotInFuture,
  wholeNumber,
  validateSelectOptions,
  requiredRadioButton,
  dateNotBeforeStrictOther,
} from "@common/utils/Validate";
import { normalizePhone, formatDate } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import { INCIDENT_CONTACT_METHOD_OPTIONS } from "@mds/common";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
import {
  getDropdownIncidentCategoryCodeOptions,
  getDropdownIncidentDeterminationOptions,
  getDropdownIncidentFollowupActionOptions,
  getDangerousOccurrenceSubparagraphOptions,
  getDropdownIncidentStatusCodeOptions,
  getIncidentStatusCodeHash,
} from "@common/selectors/staticContentSelectors";
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import * as FORM from "@/constants/forms";
import DocumentTable from "@/components/common/DocumentTable";
import {
  documentNameColumn,
  uploadedByColumn,
  uploadDateColumn,
} from "@/components/common/DocumentColumns";
import { renderConfig } from "@/components/common/config";
import customPropTypes from "@/customPropTypes";
import MinistryInternalComments from "@/components/mine/Incidents/MinistryInternalComments";
import IncidentFileUpload from "./IncidentFileUpload";

const propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  incident: customPropTypes.incident.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  handlers: PropTypes.shape({ deleteDocument: PropTypes.func }).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  incidentCategoryCodeOptions: customPropTypes.options.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  dropdownIncidentStatusCodeOptions: PropTypes.objectOf(PropTypes.string).isRequired,
  change: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      mineGuid: PropTypes.string,
      mineIncidentGuid: PropTypes.string,
    }),
  }).isRequired,
};

const INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD = "initial_incident_documents";
const FINAL_REPORT_DOCUMENTS_FORM_FIELD = "final_report_documents";
const INTERNAL_MINISTRY_DOCUMENTS_FORM_FIELD = "internal_ministry_documents";

const documentColumns = [
  documentNameColumn("document_name"),
  uploadedByColumn("update_user"),
  uploadDateColumn("upload_date"),
];

const alertText = (updateUser, updateDate, responsibleInspector, selectedStatusCode) => {
  let text = "";

  if (selectedStatusCode === "UNR" && !responsibleInspector) {
    text = `Please select an inspector responsible for this incident before changing the status to "Under Review".`;
  } else {
    switch (selectedStatusCode) {
      case "WNS":
        text = `This incident was submitted on ${formatDate(
          updateDate
        )} by ${updateUser} and has not yet been reviewed.`;
        break;
      case "UNR":
        text = `This incident currently under review by ${responsibleInspector}.`;
        break;
      case "RSS":
        text = `This incident's severity may have incorrectly been determined by the proponent, further clarification is being requested by the proponent.`;
        break;
      case "IMS":
        text = `This incident is missing critical information. The proponent has been notified that further information is required.`;
        break;
      case "AFR":
        text = `The incident requires a final report to be submitted before 60 days from creation time of the incident.`;
        break;
      case "INV":
        text = `This incident currently is under EMLI investigation.`;
        break;
      case "MIU":
        text = `This incident currently is under MIU investigation.`;
        break;
      case "FRS":
        text = `Final report submitted.`;
        break;
      case "CLD":
        text = `This incident was closed on ${formatDate(updateDate)} by ${updateUser}.`;
        break;
      case "DFT":
        text = `This incident currently is under draft ${formatDate(updateDate)} by ${updateUser}.`;
        break;
      default:
        break;
    }
  }

  return <Typography.Text>{text}</Typography.Text>;
};

const validateDoSubparagraphs = (value) =>
  value?.length === 0 ? "This is a required field" : undefined;

const formatDocumentRecords = (documents) =>
  documents?.map((doc) => ({ ...doc, key: doc.mine_document_guid }));

const retrieveInitialReportDynamicValidation = (childProps) => {
  const inspectorSet = childProps.formValues?.reported_to_inspector_party_guid;
  const workerRepSet = childProps.formValues?.johsc_worker_rep_name;
  const managementRepSet = childProps.formValues?.johsc_management_rep_name;

  return {
    inspectorContactedValidation: inspectorSet ? { validate: [requiredRadioButton] } : {},
    inspectorContacted: childProps.formValues?.reported_to_inspector_contacted,
    workerRepContactedValidation: workerRepSet ? { validate: [requiredRadioButton] } : {},
    workerRepContacted: childProps.formValues?.johsc_worker_rep_contacted,
    managementRepContactedValidation: managementRepSet ? { validate: [requiredRadioButton] } : {},
    managementRepContacted: childProps.formValues?.johsc_management_rep_contacted,
  };
};

const renderInitialReport = (childProps, isEditMode) => {
  const { incidentCategoryCodeOptions } = childProps;
  return (
    <Row>
      {/* Reporter Details */}
      <Col span={24}>
        <Typography.Title level={3} id="initial-report">
          Initial Report
        </Typography.Title>
        <h4>Reporter Details</h4>
        <Typography.Paragraph>
          Enter all available details about the reporter of this incident.
        </Typography.Paragraph>
        <Row gutter={[16]}>
          <Col xs={24} md={10}>
            <Form.Item label="* Reported by">
              <Field
                id="reported_by_name"
                name="reported_by_name"
                placeholder="Enter name of reporter..."
                component={renderConfig.FIELD}
                validate={[required]}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={10}>
            <Form.Item label="* Phone number">
              <Field
                id="reported_by_phone_no"
                name="reported_by_phone_no"
                placeholder="xxx-xxx-xxxx"
                component={renderConfig.FIELD}
                validate={[required, phoneNumber, maxLength(12)]}
                normalize={normalizePhone}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={4}>
            <Form.Item label="Ext.">
              <Field
                id="reported_by_phone_ext"
                name="reported_by_phone_ext"
                placeholder="xxxxxx"
                component={renderConfig.FIELD}
                validate={[number, maxLength(6)]}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col md={10} xs={24}>
            <Form.Item label="* Email">
              <Field
                id="reported_by_email"
                name="reported_by_email"
                placeholder="example@domain.com"
                component={renderConfig.FIELD}
                validate={[required, email]}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
        </Row>
        <br />
      </Col>
      {/* Incident Details */}
      <Col span={24}>
        <h4 id="incident-details">Incident Details</h4>
        <Typography.Paragraph>
          Enter more information regarding the reported incident. Some fields may be marked as
          optional but help the ministry understand the nature of the incident, please consider
          including them.
        </Typography.Paragraph>
        <Row gutter={[16]}>
          <Col span={24}>
            <Form.Item label="* Incident type(s)">
              <Field
                id="categories"
                name="categories"
                placeholder="Select incident type(s)..."
                component={renderConfig.MULTI_SELECT}
                validate={[requiredList]}
                data={incidentCategoryCodeOptions}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="* Incident date">
              <Field
                id="incident_date"
                name="incident_date"
                placeholder="Please select date..."
                component={renderConfig.DATE}
                validate={[required, dateNotInFuture]}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="* Incident time">
              <Field
                id="incident_time"
                name="incident_time"
                placeholder="Please select time..."
                component={renderConfig.TIME}
                validate={[required]}
                disabled={!isEditMode}
                fullWidth
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Proponent incident number (optional)">
              <Field
                id="proponent_incident_no"
                name="proponent_incident_no"
                component={renderConfig.FIELD}
                validate={[maxLength(20)]}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Number of injuries (optional)">
              <Field
                id="number_of_injuries"
                name="number_of_injuries"
                component={renderConfig.FIELD}
                validate={[wholeNumber, maxLength(10)]}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Number of fatalities (optional)">
              <Field
                id="number_of_fatalities"
                name="number_of_fatalities"
                component={renderConfig.FIELD}
                validate={[wholeNumber, maxLength(10)]}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Were emergency services called? (optional)">
              <Field
                id="emergency_services_called"
                name="emergency_services_called"
                placeholder="Please choose one..."
                component={renderConfig.RADIO}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="* Description of incident">
              <Field
                id="incident_description"
                name="incident_description"
                placeholder="Provide a detailed description of the incident..."
                component={renderConfig.SCROLL_FIELD}
                validate={[required, maxLength(4000)]}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Immediate measures taken (optional)">
              <Field
                id="immediate_measures_taken"
                name="immediate_measures_taken"
                placeholder="Provide a detailed description of any immediate measures taken..."
                component={renderConfig.SCROLL_FIELD}
                validate={[maxLength(4000)]}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="If any injuries, please describe (optional)">
              <Field
                id="injuries_description"
                name="injuries_description"
                placeholder="Provide a detailed description of any injuries..."
                component={renderConfig.SCROLL_FIELD}
                validate={[maxLength(4000)]}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Divider />
          <Col md={12} xs={24}>
            <Form.Item label="JOHSC/Worker Rep Name (optional)">
              <Field
                id="johsc_worker_rep_name"
                name="johsc_worker_rep_name"
                component={renderConfig.FIELD}
                placeholder="Enter name of representative..."
                validate={[maxLength(100)]}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Was this person contacted? (optional)">
              <Field
                id="johsc_worker_rep_contacted"
                name="johsc_worker_rep_contacted"
                component={renderConfig.RADIO}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="JOHSC/Management Rep Name (optional)">
              <Field
                id="johsc_management_rep_name"
                name="johsc_management_rep_name"
                component={renderConfig.FIELD}
                placeholder="Enter name of representative..."
                validate={[maxLength(100)]}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Was this person contacted? (optional)">
              <Field
                id="johsc_management_rep_contacted"
                name="johsc_management_rep_contacted"
                component={renderConfig.RADIO}
                disabled={!isEditMode}
              />
            </Form.Item>
            <br />
          </Col>
        </Row>
        <br />
      </Col>
    </Row>
  );
};

const renderDocumentation = (childProps, isEditMode, handlers, parentHandlers) => {
  const initialIncidentDocuments = childProps.documents.filter(
    (doc) => doc.mine_incident_document_type_code === "INI"
  );
  const finalReportDocuments = childProps.documents.filter(
    (doc) => doc.mine_incident_document_type_code === "FIN"
  );

  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={3} id="documentation">
          Documentation
        </Typography.Title>
        <Row>
          <Col xs={24} md={12}>
            <h4>Upload Initial Notification Documents</h4>
          </Col>
        </Row>
        <br />
        <h4>Incident Documents</h4>
        <br />
        <Typography.Paragraph>
          Please upload any initial notifications that will provide context with this incident
          report.
        </Typography.Paragraph>
      </Col>
      {isEditMode && (
        <Col span={24}>
          <Form.Item>
            <Field
              id={INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD}
              name={INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD}
              labelIdle='<strong class="filepond--label-action">Supporting Document Upload</strong><div>Accepted filetypes: .kmz .doc .docx .xlsx .pdf</div>'
              onFileLoad={(document_name, document_manager_guid) =>
                handlers.onFileLoad(
                  document_name,
                  document_manager_guid,
                  Strings.INCIDENT_DOCUMENT_TYPES.initial,
                  INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD
                )}
              onRemoveFile={parentHandlers.deleteDocument}
              mineGuid={childProps.match.params?.mineGuid}
              component={IncidentFileUpload}
            />
          </Form.Item>
        </Col>
      )}
      <Col span={24}>
        <DocumentTable
          documents={formatDocumentRecords(initialIncidentDocuments)}
          documentParent="Mine Incident"
          documentColumns={documentColumns}
          removeDocument={false}
        />
        <br />
      </Col>
      <Col span={24}>
        <h4 id="final-report">Final Report</h4>
        <br />
      </Col>
      {isEditMode && (
        <Col span={24}>
          <Form.Item>
            <Field
              id={FINAL_REPORT_DOCUMENTS_FORM_FIELD}
              name={FINAL_REPORT_DOCUMENTS_FORM_FIELD}
              labelIdle='<strong class="filepond--label-action">Supporting Document Upload</strong><div>Accepted filetypes: .kmz .doc .docx .xlsx .pdf</div>'
              onFileLoad={(document_name, document_manager_guid) =>
                handlers.onFileLoad(
                  document_name,
                  document_manager_guid,
                  Strings.INCIDENT_DOCUMENT_TYPES.final,
                  FINAL_REPORT_DOCUMENTS_FORM_FIELD
                )}
              onRemoveFile={parentHandlers.deleteDocument}
              mineGuid={childProps.match.params?.mineGuid}
              component={IncidentFileUpload}
            />
          </Form.Item>
        </Col>
      )}
      <Col span={24}>
        <DocumentTable
          documents={formatDocumentRecords(finalReportDocuments)}
          documentParent="Mine Incident"
          documentColumns={documentColumns}
          removeDocument={false}
        />
        <br />
      </Col>
      {!isEditMode && finalReportDocuments?.length === 0 && (
        <Col span={24}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={(
              <div className="center">
                <Typography.Paragraph strong>
                  This incident requires a final investigation report.
                </Typography.Paragraph>
                <Typography.Paragraph>
                  Pursuant to section 1.7.2 of the HSRC, an investigation report must be submitted
                  within 60 days of the reportable incident. Please add the final report
                  documentation by clicking below.
                </Typography.Paragraph>
              </div>
            )}
          />
        </Col>
      )}
    </Row>
  );
};

const renderRecommendations = ({ fields, isEditMode }) => [
  fields.map((recommendation) => (
    <Field
      name={`${recommendation}.recommendation`}
      placeholder="Write in each individual Mine Manager Recommendation here"
      component={renderConfig.AUTO_SIZE_FIELD}
      disabled={!isEditMode}
    />
  )),
  isEditMode ? (
    <Button type="primary" onClick={() => fields.push({})}>
      <PlusOutlined />
      Add Recommendation
    </Button>
  ) : null,
];

const renderMinistryFollowUp = (childProps, isEditMode) => {
  const filteredFollowUpActions = childProps.incidentFollowUpActionOptions.filter(
    (act) =>
      act.mine_incident_followup_investigation_type !== Strings.INCIDENT_FOLLOWUP_ACTIONS.unknown
  );
  const { inspectorContactedValidation, inspectorContacted } =
    retrieveInitialReportDynamicValidation(childProps);

  const formValues = useSelector((state) => getFormValues(FORM.ADD_EDIT_INCIDENT)(state));

  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={3} id="ministry-follow-up">
          Ministry Follow Up
        </Typography.Title>
        <h4>Dangerous Occurence Determination</h4>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Inspector's Determination">
              <Field
                id="determination_type_code"
                name="determination_type_code"
                placeholder="Select determination..."
                component={renderConfig.SELECT}
                data={childProps.incidentDeterminationOptions}
                disabled={!isEditMode}
                validate={[validateSelectOptions(childProps.incidentDeterminationOptions)]}
              />
            </Form.Item>
          </Col>
          {formValues?.determination_type_code &&
            formValues?.determination_type_code !==
              Strings.INCIDENT_DETERMINATION_TYPES.pending && (
              <Col xs={24} md={12}>
                <Form.Item label="* Inspector who made the determination">
                  <Field
                    id="determination_inspector_party_guid"
                    name="determination_inspector_party_guid"
                    component={renderConfig.GROUPED_SELECT}
                    data={childProps.inspectorOptions}
                    validate={[required]}
                    disabled={!isEditMode}
                  />
                </Form.Item>
              </Col>
            )}
          {formValues?.determination_type_code ===
            Strings.INCIDENT_DETERMINATION_TYPES.dangerousOccurance && (
            <Col xs={24} md={12}>
              <Form.Item label="* Which section(s) of the code apply to this dangerous occurrence?">
                <Field
                  id="dangerous_occurrence_subparagraph_ids"
                  name="dangerous_occurrence_subparagraph_ids"
                  placeholder="Please choose one or more..."
                  component={renderConfig.MULTI_SELECT}
                  data={childProps.dangerousOccurenceSubparagraphOptions}
                  validate={[required, validateDoSubparagraphs]}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
          )}
          <Col span={24}>
            <h4>Verbal Notification</h4>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Verbal notification must be provided within 4 hours of the reportable  incident. Was verbal notification of the incident provided through the Mine Incident Reporting Line (1-888-348-0299)? (Yes/No)">
              <Field
                id="verbal_notification_provided"
                name="verbal_notification_provided"
                component={renderConfig.RADIO}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          {formValues.verbal_notification_provided && (
            <Col md={12} xs={24}>
              <Form.Item label="Date and time">
                <Field
                  id="verbal_notification_timestamp"
                  name="verbal_notification_timestamp"
                  component={renderConfig.DATE}
                  showTime
                  disabled={!isEditMode}
                  placeholder="Please select date"
                  validate={[
                    dateNotInFuture,
                    dateNotBeforeStrictOther(formValues.incident_timestamp),
                  ]}
                />
              </Form.Item>
            </Col>
          )}
          <Col span={24}>
            <h4>Follow-Up Information</h4>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Incident reported to">
              <Field
                id="reported_to_inspector_party_guid"
                name="reported_to_inspector_party_guid"
                placeholder="Search for inspector..."
                component={renderConfig.GROUPED_SELECT}
                format={null}
                data={childProps.inspectorOptions}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Was this person contacted?">
              <Field
                id="reported_to_inspector_contacted"
                name="reported_to_inspector_contacted"
                component={renderConfig.RADIO}
                disabled={!isEditMode}
                {...inspectorContactedValidation}
              />
            </Form.Item>
          </Col>
          {inspectorContacted && (
            <>
              <Col md={12} xs={24}>
                <Form.Item label="Date and time">
                  <Field
                    id="reported_timestamp"
                    name="reported_timestamp"
                    component={renderConfig.DATE}
                    showTime
                    disabled={!isEditMode}
                    placeholder="Please select date"
                    validate={[
                      required,
                      dateNotInFuture,
                      dateNotBeforeStrictOther(formValues.incident_timestamp),
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col md={12} xs={24}>
                <Form.Item label="Initial Contact Method">
                  <Field
                    id="reported_to_inspector_contact_method"
                    name="reported_to_inspector_contact_method"
                    component={renderConfig.SELECT}
                    data={INCIDENT_CONTACT_METHOD_OPTIONS.filter((cm) => cm?.inspectorOnly)}
                    disabled={!isEditMode}
                    validate={[required]}
                  />
                </Form.Item>
              </Col>
            </>
          )}
          <Col md={12} xs={24}>
            <Form.Item label="Inspector responsible">
              <Field
                id="responsible_inspector_party_guid"
                name="responsible_inspector_party_guid"
                component={renderConfig.GROUPED_SELECT}
                format={null}
                placeholder="Search for responsible inspector..."
                data={childProps.inspectorOptions}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Was there a follow-up inspection?">
              <Field
                id="followup_inspection"
                name="followup_inspection"
                component={renderConfig.RADIO}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Follow-up inspection date">
              <Field
                id="followup_inspection_date"
                name="followup_inspection_date"
                placeholder="Please select date..."
                component={renderConfig.DATE}
                validate={[
                  dateNotInFuture,
                  dateNotBeforeStrictOther(formValues.incident_timestamp),
                ]}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Was it escalated to EMLI investigation?">
              <Field
                id="followup_investigation_type_code"
                name="followup_investigation_type_code"
                component={renderConfig.RADIO}
                customOptions={filteredFollowUpActions}
                disabled={!isEditMode}
                validate={validateSelectOptions(filteredFollowUpActions)}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Mine manager's recommendations">
              <FieldArray
                id="recommendations"
                name="recommendations"
                component={renderRecommendations}
                {...{
                  isEditMode,
                  handlers: childProps.handlers,
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

const renderInternalDocumentsComments = (childProps, isEditMode, handlers, parentHandlers) => {
  const incidentCreated = Boolean(childProps.formValues?.mine_incident_guid);
  const internalMinistryDocuments = childProps.documents.filter(
    (doc) => doc.mine_incident_document_type_code === "INM"
  );

  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={3} id="internal-documents">
          <LockOutlined className="violet" />
          Internal Documents and Comments (Ministry Visible Only)
        </Typography.Title>
        <Divider />
        {!incidentCreated ? (
          <div className="center">
            <Empty
              description={(
                <Typography.Paragraph strong className="center padding-md--top">
                  The internal ministry documentation section will be displayed after this incident
                  is created.
                </Typography.Paragraph>
              )}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <Row>
            <Col span={24}>
              <Row>
                <Col xs={24} md={12}>
                  <h4>Internal Ministry Documentation</h4>
                </Col>
              </Row>
              <br />
              <Typography.Paragraph strong>
                These files are for internal staff only and will not be shown to proponents. Upload
                internal documents that are created durring the review process.
              </Typography.Paragraph>
            </Col>
            {isEditMode && (
              <Col span={24}>
                <Form.Item>
                  <Field
                    id={INTERNAL_MINISTRY_DOCUMENTS_FORM_FIELD}
                    name={INTERNAL_MINISTRY_DOCUMENTS_FORM_FIELD}
                    labelIdle='<strong class="filepond--label-action">Supporting Document Upload</strong><div>Accepted filetypes: .kmz .doc .docx .xlsx .pdf</div>'
                    onFileLoad={(document_name, document_manager_guid) =>
                      handlers.onFileLoad(
                        document_name,
                        document_manager_guid,
                        Strings.INCIDENT_DOCUMENT_TYPES.internalMinistry,
                        INTERNAL_MINISTRY_DOCUMENTS_FORM_FIELD
                      )}
                    onRemoveFile={parentHandlers.deleteDocument}
                    mineGuid={childProps.match.params?.mineGuid}
                    component={IncidentFileUpload}
                  />
                </Form.Item>
              </Col>
            )}
            <Col span={24}>
              <DocumentTable
                documents={formatDocumentRecords(internalMinistryDocuments)}
                documentParent="Mine Incident"
                documentColumns={documentColumns}
                removeDocument={false}
              />
            </Col>
            <Col span={24}>
              <br />
              <MinistryInternalComments
                mineIncidentGuid={childProps.incident?.mine_incident_guid}
              />
            </Col>
          </Row>
        )}
      </Col>
    </Row>
  );
};

const updateIncidentStatus = (childProps, isNewIncident) => {
  const isClosed = childProps.incident?.status_code === "CLD";
  const selectedStatusCode = childProps.formValues.status_code;
  const responsibleInspector = childProps.incident?.responsible_inspector_party;
  return !isNewIncident ? (
    <Col span={24}>
      <Alert
        message={
          childProps.incidentStatusCodeHash[childProps.incident?.status_code] || "Undefined Status"
        }
        description={(
          <Row>
            <Col xs={24} md={18}>
              <p>
                {alertText(
                  childProps.incident?.update_user,
                  childProps.incident?.update_timestamp,
                  responsibleInspector,
                  selectedStatusCode
                )}
              </p>
            </Col>
            <Col xs={24} md={6}>
              {!isClosed && childProps.isEditMode && (
                <Form.Item>
                  <Field
                    id="status_code"
                    name="status_code"
                    label=""
                    placeholder="Action"
                    component={renderConfig.SELECT}
                    validate={[required]}
                    data={childProps.dropdownIncidentStatusCodeOptions}
                  />
                </Form.Item>
              )}
              {!childProps.pristine && !isClosed && (
                <div className="right center-mobile">
                  <Button
                    className="full-mobile"
                    type="primary"
                    htmlType="submit"
                    disabled={selectedStatusCode === "UNR" && !responsibleInspector}
                  >
                    Update Status
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        )}
        type={!isClosed ? "warning" : "info"}
        showIcon
        style={{
          backgroundColor: isClosed ? "#FFFFFF" : "",
          border: isClosed ? "1.5px solid #5e46a1" : "",
        }}
        className={isClosed ? "ant-alert-info ant-alert-info-custom-core-color-icon" : null}
      />
    </Col>
  ) : null;
};

const renderEditSaveControls = (childProps, isEditMode, isNewIncident) => (
  <div className="right center-mobile violet">
    {isEditMode && (
      <Button
        id="mine-incident-submit"
        className="full-mobile right"
        type="primary"
        htmlType="submit"
        loading={childProps.submitting}
        disabled={childProps.submitting}
      >
        {isNewIncident ? "Create Incident" : "Save Changes"}
      </Button>
    )}
  </div>
);

export const IncidentForm = (props) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onFileLoad = (fileName, document_manager_guid, documentTypeCode, documentFormField) => {
    const updatedUploadedFiles = [
      ...uploadedFiles,
      {
        document_name: fileName,
        document_manager_guid,
        mine_incident_document_type_code: documentTypeCode,
      },
    ];
    setUploadedFiles(updatedUploadedFiles);

    return props.change(documentFormField, updatedUploadedFiles);
  };
  const onRemoveFile = (err, fileItem, documentFormField) => {
    const updatedUploadedFiles = uploadedFiles.filter(
      (doc) => doc.document_manager_guid !== fileItem.serverId
    );
    setUploadedFiles(updatedUploadedFiles);

    return props.change(documentFormField, updatedUploadedFiles);
  };

  const { isEditMode, handlers: parentHandlers } = props;
  const localHandlers = { onFileLoad, onRemoveFile };
  const isNewIncident = Boolean(!props.match.params?.mineIncidentGuid);

  return (
    <Form layout="vertical" onSubmit={props.handleSubmit(parentHandlers.handleSaveData)}>
      <Col span={24}>{updateIncidentStatus(props, isNewIncident)}</Col>
      <Row>
        <Col span={24}>{renderEditSaveControls(props, isEditMode, isNewIncident)}</Col>
        <Col span={16} offset={4}>
          {renderInitialReport(props, isEditMode)}
          <br />
          {renderDocumentation(props, isEditMode, localHandlers, parentHandlers)}
          <br />
          {renderMinistryFollowUp(props, isEditMode)}
          <br />
          {renderInternalDocumentsComments(props, isEditMode, localHandlers, parentHandlers)}
        </Col>
        <Col span={24}>
          <br />
          {renderEditSaveControls(props, isEditMode, isNewIncident)}
        </Col>
      </Row>
    </Form>
  );
};

IncidentForm.propTypes = propTypes;

const selector = formValueSelector(FORM.ADD_EDIT_INCIDENT);

const mapStateToProps = (state) => ({
  incidentCategoryCodeOptions: getDropdownIncidentCategoryCodeOptions(state),
  incidentDeterminationOptions: getDropdownIncidentDeterminationOptions(state),
  incidentStatusCodeHash: getIncidentStatusCodeHash(state),
  dangerousOccurenceSubparagraphOptions: getDangerousOccurrenceSubparagraphOptions(state),
  incidentFollowUpActionOptions: getDropdownIncidentFollowupActionOptions(state),
  inspectorOptions: getDropdownInspectors(state) || [],
  documents: selector(state, "documents") || [],
  formValues: getFormValues(FORM.ADD_EDIT_INCIDENT)(state) || {},
  dropdownIncidentStatusCodeOptions: getDropdownIncidentStatusCodeOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.ADD_EDIT_INCIDENT,
    enableReinitialize: true,
    touchOnBlur: true,
    touchOnChange: false,
  })
)(IncidentForm);

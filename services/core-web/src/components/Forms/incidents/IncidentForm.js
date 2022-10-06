import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import { Field, FieldArray, reduxForm, change, getFormValues, formValueSelector } from "redux-form";
import { LockOutlined, PlusOutlined } from "@ant-design/icons";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row, Typography, Divider, Empty, Button, Popconfirm } from "antd";
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
} from "@common/utils/Validate";
import { normalizePhone } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
import {
  getDropdownIncidentCategoryCodeOptions,
  getDropdownIncidentDeterminationOptions,
  getDropdownIncidentFollowupActionOptions,
  getDangerousOccurrenceSubparagraphOptions,
  getIncidentStatusCodeHash,
} from "@common/selectors/staticContentSelectors";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import * as FORM from "@/constants/forms";
import * as Permission from "@/constants/permissions";
import DocumentTable from "@/components/common/DocumentTable";
import {
  documentNameColumn,
  uploadedByColumn,
  uploadDateColumn,
} from "@/components/common/DocumentColumns";
import { renderConfig } from "@/components/common/config";
import customPropTypes from "@/customPropTypes";
import IncidentFileUpload from "./IncidentFileUpload";

const propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  incident: customPropTypes.incident.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  handlers: PropTypes.shape({ deleteDocument: PropTypes.func }).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  incidentCategoryCodeOptions: customPropTypes.options.isRequired,
  change: PropTypes.func.isRequired,
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

const validateDoSubparagraphs = (value) =>
  value?.length === 0 ? "This is a required field" : undefined;

const formatDocumentRecords = (documents) =>
  documents?.map((doc) => ({ ...doc, key: doc.mine_document_guid }));

const renderInitialReport = ({ incidentCategoryCodeOptions }, isEditMode) => (
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
          <Form.Item label="Phone number (optional)">
            <Field
              id="reported_by_phone_no"
              name="reported_by_phone_no"
              placeholder="xxx-xxx-xxxx"
              component={renderConfig.FIELD}
              validate={[phoneNumber, maxLength(12)]}
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
          <Form.Item label="Email (optional)">
            <Field
              id="reported_by_email"
              name="reported_by_email"
              placeholder="example@domain.com"
              component={renderConfig.FIELD}
              validate={[email]}
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
        {/* Mine Dangerous Occurrence Determination */}
        <Col span={24}>
          <h4>Mine Dangerous Occurrence Determination</h4>
          <Typography.Paragraph>
            If you determine that this incident was a dangerous occurance will be required to submit
            your investigation report.
          </Typography.Paragraph>
        </Col>
        <Col md={12} xs={24}>
          <Form.Item label="Was this a dangerous occurrence? (optional)">
            <Field
              id="mine_determination_type_code"
              name="mine_determination_type_code"
              component={renderConfig.RADIO}
              disabled={!isEditMode}
            />
          </Form.Item>
        </Col>
        <Col md={12} xs={24}>
          <Form.Item label="Mine representative who made determination (optional)">
            <Field
              id="mine_determination_representative"
              name="mine_determination_representative"
              placeholder="Enter name of representative..."
              component={renderConfig.FIELD}
              validate={[maxLength(255)]}
              disabled={!isEditMode}
            />
          </Form.Item>
        </Col>
      </Row>
      <br />
    </Col>
  </Row>
);

const renderDocumentation = (props, isEditMode, handlers, parentHandlers) => {
  const initialIncidentDocuments = props.documents.filter(
    (doc) => doc.mine_incident_document_type_code === "INI"
  );
  const finalReportDocuments = props.documents.filter(
    (doc) => doc.mine_incident_document_type_code === "FIN"
  );
  const isDangerousOccurence = props.incident?.mine_determination_type_code === "DO";

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
          <Col xs={24} md={12}>
            {!isEditMode && (
              <div className="right center-mobile">
                <Button
                  id="mine-incident-add-documentation"
                  type="secondary"
                  onClick={parentHandlers.toggleEditMode}
                  className="full-mobile violet violet-border"
                >
                  + Add Documentation
                </Button>
              </div>
            )}
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
                )
              }
              onRemoveFile={parentHandlers.deleteDocument}
              mineGuid={props.match.params?.mineGuid}
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
                )
              }
              onRemoveFile={parentHandlers.deleteDocument}
              mineGuid={props.match.params?.mineGuid}
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
      {!isEditMode && isDangerousOccurence && finalReportDocuments?.length === 0 && (
        <Col span={24}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="center">
                <Typography.Paragraph strong>
                  This incident requires a final investigation report.
                </Typography.Paragraph>
                <Typography.Paragraph>
                  You determined that this incident was a dangerous occurence. Please add your final
                  report documentation by clicking below.
                </Typography.Paragraph>
                <Button type="primary" onClick={parentHandlers.toggleEditMode}>
                  Add Final Report
                </Button>
              </div>
            }
          />
        </Col>
      )}
    </Row>
  );
};

const renderRecommendations = ({ fields, isEditMode, handlers }) => [
  fields.map((recommendation) => (
    <Field
      name={`${recommendation}.recommendation`}
      placeholder="Write in each individual Mine Manager Recommendation here"
      component={renderConfig.AUTO_SIZE_FIELD}
      disabled={!isEditMode}
    />
  )),
  <Button type="primary" onClick={() => (isEditMode ? fields.push({}) : handlers.toggleEditMode())}>
    <PlusOutlined />
    Add Recommendation
  </Button>,
];

const renderMinistryFollowUp = (props, isEditMode) => {
  const filteredFollowUpActions = props.incidentFollowUpActionOptions.filter(
    (act) =>
      act.mine_incident_followup_investigation_type !== Strings.INCIDENT_FOLLOWUP_ACTIONS.unknown
  );

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
                data={props.incidentDeterminationOptions}
                disabled={!isEditMode}
                validate={[validateSelectOptions(props.incidentDeterminationOptions)]}
              />
            </Form.Item>
          </Col>
          {props.formValues?.determination_type_code &&
            props.formValues?.determination_type_code !==
              Strings.INCIDENT_DETERMINATION_TYPES.pending && (
              <Col xs={24} md={12}>
                <Form.Item label="* Inspector who made the determination">
                  <Field
                    id="determination_inspector_party_guid"
                    name="determination_inspector_party_guid"
                    component={renderConfig.GROUPED_SELECT}
                    data={props.inspectorOptions}
                    validate={[required]}
                    disabled={!isEditMode}
                  />
                </Form.Item>
              </Col>
            )}
          {props.formValues?.determination_type_code ===
            Strings.INCIDENT_DETERMINATION_TYPES.dangerousOccurance && (
            <Col xs={24} md={12}>
              <Form.Item label="* Which section(s) of the code apply to this dangerous occurrence?">
                <Field
                  id="dangerous_occurrence_subparagraph_ids"
                  name="dangerous_occurrence_subparagraph_ids"
                  placeholder="Please choose one or more..."
                  component={renderConfig.MULTI_SELECT}
                  data={props.dangerousOccurenceSubparagraphOptions}
                  validate={[required, validateDoSubparagraphs]}
                  disabled={!isEditMode}
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
                validate={[required]}
                data={props.inspectorOptions}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Inspector responsible">
              <Field
                id="responsible_inspector_party_guid"
                name="responsible_inspector_party_guid"
                component={renderConfig.GROUPED_SELECT}
                format={null}
                placeholder="Search for responsible inspector..."
                validate={[required]}
                data={props.inspectorOptions}
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
                validate={[dateNotInFuture]}
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
                  handlers: props.handlers,
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

const renderInternalDocumentsComments = (props, isEditMode, handlers, parentHandlers) => {
  const incidentCreated = Boolean(props.formValues?.mine_incident_guid);
  const internalMinistryDocuments = props.documents.filter(
    (doc) => doc.mine_incident_document_type_code === "INM"
  );

  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={3} id="internal-documents">
          <LockOutlined className="violet" /> Internal Documents and Comments (Ministry Visible
          Only)
        </Typography.Title>
        <Divider />
        {!incidentCreated ? (
          <div className="center">
            <Empty
              description={
                <Typography.Paragraph strong className="center padding-md--top">
                  The internal ministry documentation section will be displayed after this incident
                  is created.
                </Typography.Paragraph>
              }
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
                <Col xs={24} md={12}>
                  {!isEditMode && (
                    <div className="right center-mobile">
                      <Button
                        id="mine-incident-add-documents"
                        type="primary"
                        onClick={parentHandlers.toggleEditMode}
                        className="full-mobile"
                      >
                        + Add Documents
                      </Button>
                    </div>
                  )}
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
                      )
                    }
                    onRemoveFile={parentHandlers.deleteDocument}
                    mineGuid={props.match.params?.mineGuid}
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
          </Row>
        )}
      </Col>
    </Row>
  );
};

const renderEditSaveControls = (props, isEditMode, isNewIncident) => (
  <div className="right center-mobile violet">
    {!isEditMode && (
      <Button
        id="mine-incident-edit"
        className="full-mobile violet violet-border"
        type="secondary"
        onClick={props.handlers.toggleEditMode}
      >
        <img alt="pencil" src={EDIT_OUTLINE_VIOLET} />
        &nbsp;Edit Incident
      </Button>
    )}
    {isEditMode && (
      <>
        <Popconfirm
          placement="topLeft"
          title="Are you sure you want to cancel this submission? All unsaved changes will be lost."
          onConfirm={() => props.handlers.handleCancelEdit(isNewIncident)}
          okText="Yes"
          cancelText="No"
        >
          <Button className="full-mobile right violet violet-border" type="secondary">
            Cancel
          </Button>
        </Popconfirm>
        <Button
          id="mine-incident-submit"
          className="full-mobile right"
          type="primary"
          htmlType="submit"
          loading={props.submitting}
          disabled={props.submitting}
        >
          {isNewIncident ? "Create Incident" : "Save Changes"}
        </Button>
      </>
    )}
  </div>
);

const IncidentForm = (props) => {
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
    <Form layout="vertical" onSubmit={parentHandlers.handleSaveData}>
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
)(AuthorizationGuard(Permission.IN_TESTING)(IncidentForm));

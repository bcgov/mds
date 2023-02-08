import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import { Field, reduxForm, change, getFormValues, FieldArray } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Card, Checkbox, Col, Row, Typography, Divider, Button } from "antd";
import {
  required,
  requiredList,
  maxLength,
  email,
  phoneNumber,
  number,
  dateNotInFuture,
  dateNotBeforeStrictOther,
  wholeNumber,
  requiredRadioButton,
} from "@common/utils/Validate";
import { normalizePhone } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
import {
  getDropdownIncidentCategoryCodeOptions,
  getDropdownIncidentStatusCodeOptions,
  getDropdownIncidentFollowupActionOptions,
} from "@common/selectors/staticContentSelectors";
import { closeModal, openModal } from "@common/actions/modalActions";
import { INCIDENT_CONTACT_METHOD_OPTIONS } from "@mds/common";
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import * as FORM from "@/constants/forms";
import * as Permission from "@/constants/permissions";
import DocumentTable from "@/components/common/DocumentTable";
import { uploadDateColumn, uploadedByColumn } from "@/components/common/DocumentColumns";
import { renderConfig } from "@/components/common/config";
import Callout from "@/components/common/Callout";
import customPropTypes from "@/customPropTypes";
import IncidentFileUpload from "./IncidentFileUpload";

const propTypes = {
  incident: customPropTypes.incident.isRequired,
  inspectorOptions: customPropTypes.groupedDropdownList.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  handlers: PropTypes.shape({ deleteDocument: PropTypes.func }).isRequired,
  incidentCategoryCodeOptions: customPropTypes.options.isRequired,
  change: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  applicationSubmitted: PropTypes.bool,
  isFinalReviewStage: PropTypes.bool,
  isReviewSubmitStage: PropTypes.bool,
  location: PropTypes.shape({
    state: PropTypes.shape({
      current: PropTypes.number,
    }),
  }).isRequired,
};

const defaultProps = {
  applicationSubmitted: false,
  isFinalReviewStage: false,
  isReviewSubmitStage: false,
};

export const INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD = "initial_notification_documents";
export const FINAL_REPORT_DOCUMENTS_FORM_FIELD = "final_report_documents";

const documentColumns = [
  uploadedByColumn("Uploader", "update_user"),
  uploadDateColumn("upload_date"),
];

const retrieveIncidentDetailsDynamicValidation = (childProps) => {
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

const confirmationSubmission = (childProps) =>
  !childProps.applicationSubmitted &&
  childProps.location?.state?.current === 2 && (
    <Col span={24}>
      <Card>
        <>
          <p>
            <b>Confirmation of Submission</b>
          </p>
          <p>
            <span>
              <Checkbox
                checked={childProps.confirmedSubmission}
                onChange={childProps.setConfirmedSubmission}
              />
              &nbsp;&nbsp;
            </span>
            I confirm that any information provided is accurate and complete to the best of my
            knowledge.
            <span style={{ color: "red" }}>*</span>
          </p>
        </>
      </Card>
      <br />
    </Col>
  );

const incidentStatusCalloutContent = (statusCode) => {
  switch (statusCode) {
    case "AFR":
      return {
        message:
          "The incident requires a final report to be submitted before 60 days from creation time of the incident.",
        title: "This Incident Requires Final Investigation Documentation",
        severity: Strings.CALLOUT_SEVERITY.warning,
      };
    case "FRS":
      return {
        message:
          "This incident has not yet been reviewed by ministry staff. You will be notified if further clarification is required.",
        title: "This Incident is Pending Ministry Review",
        severity: Strings.CALLOUT_SEVERITY.warning,
      };
    case "INV":
      return {
        message:
          "This incident has been reviewed and is currently under investigation. You will be notified if further clarification is required.",
        title: "This Incident is under investigation",
        severity: Strings.CALLOUT_SEVERITY.warning,
      };
    case "UNR":
      return {
        message:
          "This incident has been reviewed and is currently under investigation. You will be notified if further clarification is required.",
        title: "This Incident is under investigation",
        severity: Strings.CALLOUT_SEVERITY.warning,
      };
    case "MIU":
      return {
        message:
          "This incident has been reviewed and is currently under investigation. You will be notified if further clarification is required.",
        title: "This Incident is under investigation",
        severity: Strings.CALLOUT_SEVERITY.warning,
      };
    case "CLD":
      return {
        message: "This incident has been reviewed and has been closed.",
        title: "This Incident Has been closed",
        severity: Strings.CALLOUT_SEVERITY.warning,
      };
    default:
      return {
        message: null,
        title: null,
        severity: null,
      };
  }
};

const renderIncidentStatusCallout = (childProps) => {
  const { status_code } = childProps.incident;
  const { title, message, severity } = incidentStatusCalloutContent(status_code);

  return (
    <Callout
      message={(
        <div>
          <h4 style={{ color: "#313132", fontWeight: 700 }}>{title}</h4>
          <p>{message}</p>
        </div>
      )}
      severity={severity}
    />
  );
};

const renderInitialReport = (childProps, formDisabled) => (
  <Row>
    <Col span={24}>
      <Typography.Title level={3} id="initial-report">
        Initial Report
      </Typography.Title>
      <Typography.Paragraph>
        Select one or more incident types for this submission.
      </Typography.Paragraph>
      <Form.Item label="Incident type(s)">
        <Field
          id="categories"
          name="categories"
          placeholder="Select incident type(s)"
          component={renderConfig.MULTI_SELECT}
          validate={[requiredList]}
          data={childProps?.incidentCategoryCodeOptions}
          disabled={formDisabled}
        />
      </Form.Item>
    </Col>
  </Row>
);

const renderReporterDetails = (childProps, formDisabled) => (
  <Row gutter={[16]}>
    <Col span={24}>
      <Typography.Title level={4}>Reporter Details</Typography.Title>
      <Typography.Paragraph>
        Enter all available details about the reporter of this incident.
      </Typography.Paragraph>
    </Col>
    <Col xs={24} md={10}>
      <Form.Item label="Reported by">
        <Field
          id="reported_by_name"
          name="reported_by_name"
          placeholder="Enter name of reporter"
          component={renderConfig.FIELD}
          validate={[required]}
          disabled={formDisabled}
        />
      </Form.Item>
    </Col>
    <Col xs={24} md={10}>
      <Form.Item label="Phone number">
        <Field
          id="reported_by_phone_no"
          name="reported_by_phone_no"
          placeholder="xxx-xxx-xxxx"
          component={renderConfig.FIELD}
          validate={[required, phoneNumber, maxLength(12)]}
          normalize={normalizePhone}
          disabled={formDisabled}
        />
      </Form.Item>
    </Col>
    <Col xs={24} md={4}>
      <Form.Item label="Ext. (optional)">
        <Field
          id="reported_by_phone_ext"
          name="reported_by_phone_ext"
          placeholder="xxxxxx"
          component={renderConfig.FIELD}
          validate={[number, maxLength(6)]}
          disabled={formDisabled}
        />
      </Form.Item>
    </Col>
    <Col md={10} xs={24}>
      <Form.Item label="Email">
        <Field
          id="reported_by_email"
          name="reported_by_email"
          placeholder="example@domain.com"
          component={renderConfig.FIELD}
          validate={[required, email]}
          disabled={formDisabled}
        />
      </Form.Item>
    </Col>
  </Row>
);

const renderIncidentDetails = (childProps, formDisabled) => {
  const {
    workerRepContactedValidation,
    workerRepContacted,
    managementRepContactedValidation,
    managementRepContacted,
  } = retrieveIncidentDetailsDynamicValidation(childProps);

  return (
    <Row gutter={[16]}>
      <Col span={24}>
        <Typography.Title level={4}>Incident Details</Typography.Title>
        <Typography.Paragraph>
          Enter more information regarding the reported incident. Some fields may be marked as
          optional but help the ministry understand the nature of the incident, please consider
          including them.
        </Typography.Paragraph>
      </Col>
      <Col span={24}>
        <Form.Item label="Incident date and time">
          <Field
            id="incident_timestamp"
            name="incident_timestamp"
            placeholder="Please select date and time"
            component={renderConfig.DATE}
            showTime
            validate={[required, dateNotInFuture]}
            disabled={formDisabled}
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
            disabled={formDisabled}
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
            disabled={formDisabled}
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
            disabled={formDisabled}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item label="Were emergency services called? (optional)">
          <Field
            id="emergency_services_called"
            name="emergency_services_called"
            placeholder="Please choose one"
            component={renderConfig.RADIO}
            disabled={formDisabled}
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item label="Description of incident">
          <Field
            id="incident_description"
            name="incident_description"
            placeholder="Provide a detailed description of the incident"
            component={renderConfig.SCROLL_FIELD}
            validate={[required, maxLength(4000)]}
            disabled={formDisabled}
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item label="Immediate measures taken (optional)">
          <Field
            id="immediate_measures_taken"
            name="immediate_measures_taken"
            placeholder="Provide a detailed description of any immediate measures taken"
            component={renderConfig.SCROLL_FIELD}
            validate={[maxLength(4000)]}
            disabled={formDisabled}
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item label="If any injuries, please describe (optional)">
          <Field
            id="injuries_description"
            name="injuries_description"
            placeholder="Provide a detailed description of any injuries"
            component={renderConfig.SCROLL_FIELD}
            validate={[maxLength(4000)]}
            disabled={formDisabled}
          />
        </Form.Item>
      </Col>
      <Divider />
      <Col span={24}>
        <Typography.Title level={4}>
          Inspectors, OHSC, Local Union or Worker Representatives
        </Typography.Title>
      </Col>
      <Col span={24}>
        <Typography.Paragraph>
          Please enter the details of those who have been contacted
        </Typography.Paragraph>
      </Col>
      <Col span={24}>
        <Typography.Title level={5}>Verbal Notification</Typography.Title>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item label="Verbal notification must be provided within 4 hours of the reportable  incident. Was verbal notification of the incident provided through the Mine Incident Reporting Line (1-888-348-0299)? (Yes/No)">
          <Field
            id="verbal_notification_provided"
            name="verbal_notification_provided"
            component={renderConfig.RADIO}
            disabled={formDisabled}
            validate={[requiredRadioButton]}
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <hr />
        <Typography.Title level={5}>OHSC Worker Representative</Typography.Title>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item label="OHSC Worker Rep Name (optional)">
          <Field
            id="johsc_worker_rep_name"
            name="johsc_worker_rep_name"
            component={renderConfig.FIELD}
            placeholder="Enter name"
            validate={[maxLength(100)]}
            disabled={formDisabled}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item label="Has this person already been informed of the incident?">
          <Field
            id="johsc_worker_rep_contacted"
            name="johsc_worker_rep_contacted"
            component={renderConfig.RADIO}
            disabled={formDisabled}
            {...workerRepContactedValidation}
          />
        </Form.Item>
      </Col>
      {workerRepContacted && (
        <>
          <Col md={12} xs={24}>
            <Form.Item label="Date and time">
              <Field
                id="johsc_worker_rep_contact_timestamp"
                name="johsc_worker_rep_contact_timestamp"
                component={renderConfig.DATE}
                showTime
                disabled={formDisabled}
                placeholder="Please select date and time"
                validate={[
                  required,
                  dateNotInFuture,
                  dateNotBeforeStrictOther(childProps.formValues.incident_timestamp),
                ]}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Initial Contact Method">
              <Field
                id="johsc_worker_rep_contact_method"
                name="johsc_worker_rep_contact_method"
                component={renderConfig.RADIO}
                customOptions={INCIDENT_CONTACT_METHOD_OPTIONS.filter((cm) => !cm?.inspectorOnly)}
                disabled={formDisabled}
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </>
      )}
      <Col span={24}>
        <hr />
        <Typography.Title level={5}>OHSC Management Representative</Typography.Title>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item label="OHSC Management Rep Name (optional)">
          <Field
            id="johsc_management_rep_name"
            name="johsc_management_rep_name"
            component={renderConfig.FIELD}
            placeholder="Enter name"
            validate={[maxLength(100)]}
            disabled={formDisabled}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item label="Has this person already been informed of the incident?">
          <Field
            id="johsc_management_rep_contacted"
            name="johsc_management_rep_contacted"
            component={renderConfig.RADIO}
            disabled={formDisabled}
            {...managementRepContactedValidation}
          />
        </Form.Item>
      </Col>
      {managementRepContacted && (
        <>
          <Col md={12} xs={24}>
            <Form.Item label="Date and time">
              <Field
                id="johsc_management_rep_contact_timestamp"
                name="johsc_management_rep_contact_timestamp"
                component={renderConfig.DATE}
                showTime
                disabled={formDisabled}
                placeholder="Please select date and time"
                validate={[
                  required,
                  dateNotInFuture,
                  dateNotBeforeStrictOther(childProps.formValues.incident_timestamp),
                ]}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Initial Contact Method">
              <Field
                id="johsc_management_rep_contact_method"
                name="johsc_management_rep_contact_method"
                component={renderConfig.RADIO}
                customOptions={INCIDENT_CONTACT_METHOD_OPTIONS.filter((cm) => !cm?.inspectorOnly)}
                disabled={formDisabled}
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </>
      )}
    </Row>
  );
};

const renderUploadInitialNotificationDocuments = (
  childProps,
  handlers,
  parentHandlers,
  formDisabled
) => {
  const { mine_guid: mineGuid, mine_incident_guid: mineIncidentGuid } = childProps.formValues;
  const title = childProps?.isFinalReviewStage ? "Documentation" : "Record Files";
  const subTitle = childProps?.isFinalReviewStage
    ? "Incident Documents"
    : "Initial Notification Documents";

  const formValuesDocumentsInitial = childProps.formValues?.documents
    ? childProps.formValues?.documents?.filter(
        (doc) => doc.mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.initial
      )
    : [];

  const formValuesDocumentsFinalReport =
    childProps.formValues?.documents?.filter(
      (doc) => doc.mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.final
    ) ?? [];

  const formValuesInitialNotificationDocs = childProps.formValues?.initial_notification_documents
    ? childProps.formValues?.initial_notification_documents?.filter(
        (doc) => doc.mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.initial
      )
    : [];

  const formValuesFinaltReportDocs = childProps.formValues?.final_report_documents
    ? childProps.formValues?.final_report_documents?.filter(
        (doc) => doc.mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.final
      )
    : [];

  const initialDocumentsForm = [
    ...new Map(
      [...formValuesDocumentsInitial, ...formValuesInitialNotificationDocs].map((item) => [
        item.document_manager_guid,
        item,
      ])
    ).values(),
  ];

  const initialIncidentDocuments = [...(initialDocumentsForm || [])];

  const finalReportDocumentsForm = [
    ...new Map(
      [...formValuesDocumentsFinalReport, ...formValuesFinaltReportDocs].map((item) => [
        item.document_manager_guid,
        item,
      ])
    ).values(),
  ];

  const finalReportDocuments = [...(finalReportDocumentsForm || [])];

  const notInitialDocumentsInForm =
    !childProps.formValues?.documents || initialDocumentsForm.length === 0;

  const notFinalReportInForm =
    !childProps.formValues?.documents || finalReportDocumentsForm.length === 0;

  return (
    <Row>
      {formDisabled && (
        <Typography.Title level={3} id="documentation">
          {title}
        </Typography.Title>
      )}
      {notInitialDocumentsInForm &&
        (!childProps.formValues.status_code || childProps.formValues.status_code === "DFT") &&
        !childProps.isFinalReviewStage && (
          <>
            <Col span={24}>
              <Typography.Title level={4}>
                Upload Supporting Notification Documentation
              </Typography.Title>
              <Typography.Paragraph>
                Please upload any documents that support this written incident notification. You may
                return later to upload additional documents as needed.
              </Typography.Paragraph>
            </Col>
            <Col span={24}>
              <Form.Item>
                <Field
                  id={INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD}
                  name={INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD}
                  onFileLoad={(document_name, document_manager_guid) =>
                    handlers.onFileLoad(
                      document_name,
                      document_manager_guid,
                      Strings.INCIDENT_DOCUMENT_TYPES.initial,
                      INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD
                    )}
                  onRemoveFile={parentHandlers?.deleteDocument}
                  mineGuid={childProps.match.params?.mineGuid}
                  component={IncidentFileUpload}
                  labelIdle='<strong class="filepond--label-action">Supporting Document Upload</strong><div>Accepted filetypes: .kmz .doc .docx .xlsx .pdf</div>'
                />
              </Form.Item>
            </Col>
          </>
        )}

      <Col span={24}>
        <Row>
          <Col xs={24} md={12}>
            <Typography.Title level={4}>{subTitle}</Typography.Title>
          </Col>
          {(formValuesDocumentsInitial?.length > 0 || childProps.isFinalReviewStage) && (
            <Col xs={24} md={12}>
              <div className="right center-mobile">
                <Button
                  id="mine-incident-add-documentation"
                  type="secondary"
                  onClick={(e) =>
                    parentHandlers.openUploadIncidentDocumentsModal(
                      e,
                      Strings.INCIDENT_DOCUMENT_TYPES.initial
                    )}
                  className="full-mobile violet violet-border"
                >
                  + Add Documentation
                </Button>
              </div>
            </Col>
          )}
        </Row>
        {formDisabled && (
          <DocumentTable
            documents={initialIncidentDocuments}
            documentColumns={documentColumns}
            documentParent="Mine Incident"
          />
        )}
        {!formDisabled && (
          <DocumentTable
            documents={initialIncidentDocuments}
            documentColumns={documentColumns}
            documentParent="Mine Incident"
            handleDeleteDocument={childProps.handlers.deleteDocument}
            deletePayload={{ mineGuid, mineIncidentGuid }}
            deletePermission
          />
        )}

        {notFinalReportInForm &&
          (!childProps.formValues.status_code || childProps.formValues.status_code === "DFT") &&
          !childProps.isFinalReviewStage && (
            <>
              <Col span={24}>
                <Typography.Title level={4}>Upload Final Report</Typography.Title>
                <Typography.Paragraph>
                  Please upload the final report that support this written incident notification.
                  You may return later to upload additional documents as needed.
                </Typography.Paragraph>
              </Col>
              <Col span={24}>
                <Form.Item>
                  <Field
                    id={FINAL_REPORT_DOCUMENTS_FORM_FIELD}
                    name={FINAL_REPORT_DOCUMENTS_FORM_FIELD}
                    onFileLoad={(document_name, document_manager_guid) =>
                      handlers.onFileLoad(
                        document_name,
                        document_manager_guid,
                        Strings.INCIDENT_DOCUMENT_TYPES.final,
                        FINAL_REPORT_DOCUMENTS_FORM_FIELD
                      )}
                    onRemoveFile={parentHandlers?.deleteDocument}
                    mineGuid={childProps.match.params?.mineGuid}
                    component={IncidentFileUpload}
                    labelIdle='<strong class="filepond--label-action">Final Report Upload</strong><div>Accepted filetypes: .kmz .doc .docx .xlsx .pdf</div>'
                  />
                </Form.Item>
              </Col>
            </>
          )}
        <Row>
          <Col xs={24} md={12}>
            <Typography.Title level={4}>Final Report Documents</Typography.Title>
          </Col>
          {(formValuesDocumentsFinalReport?.length > 0 || childProps.isFinalReviewStage) && (
            <Col xs={24} md={12}>
              <div className="right center-mobile">
                <Button
                  type="primary"
                  onClick={(e) =>
                    parentHandlers.openUploadIncidentDocumentsModal(
                      e,
                      Strings.INCIDENT_DOCUMENT_TYPES.final
                    )}
                  className="full-mobile violet violet-border"
                >
                  + Add Final Report
                </Button>
              </div>
            </Col>
          )}
        </Row>
        {formDisabled && (
          <DocumentTable
            documents={finalReportDocuments}
            documentColumns={documentColumns}
            documentParent="Mine Incident"
          />
        )}

        {!formDisabled && (
          <DocumentTable
            documents={finalReportDocuments}
            documentColumns={documentColumns}
            documentParent="Mine Incident"
            handleDeleteDocument={childProps.handlers.deleteDocument}
            deletePayload={{ mineGuid, mineIncidentGuid }}
            deletePermission
          />
        )}
      </Col>
    </Row>
  );
};

const renderRecommendations = ({ fields }) => {
  if (fields?.length === 0) {
    return [<Field name="recommendations" component={renderConfig.AUTO_SIZE_FIELD} disabled />];
  }
  return [
    fields.map((recommendation) => (
      <Field name={`${recommendation}.recommendation`} component={renderConfig.AUTO_SIZE_FIELD} />
    )),
  ];
};

const renderMinistryFollowUp = (childProps, formDisabled) => (
  <Row gutter={[16]}>
    <Col span={24}>
      <Typography.Title id="ministry-follow-up" level={3}>
        Ministry Follow Up
      </Typography.Title>
      <Typography.Title level={4}>Follow-Up Information</Typography.Title>
    </Col>
    <Col md={12} xs={24}>
      <Form.Item label="Was there a follow-up inspection?">
        <Field
          id="followup_inspection"
          name="followup_inspection"
          component={renderConfig.RADIO}
          disabled={formDisabled}
        />
      </Form.Item>
    </Col>
    <Col md={12} xs={24}>
      <Form.Item label="Follow-up inspection date">
        <Field
          id="followup_inspection_date"
          name="followup_inspection_date"
          component={renderConfig.DATE}
          disabled={formDisabled}
        />
      </Form.Item>
    </Col>
    <Col md={12} xs={24}>
      <Form.Item label="Was it escalated to EMLI investigation?">
        <Field
          id="followup_investigation_type_code"
          name="followup_investigation_type_code"
          component={renderConfig.SELECT}
          data={childProps.incidentFollowupActionOptions}
          disabled={formDisabled}
        />
      </Form.Item>
    </Col>
    <Col md={12} xs={24}>
      <Form.Item label="Incident Status">
        <Field
          id="status_code"
          name="status_code"
          component={renderConfig.SELECT}
          data={childProps.incidentStatusCodeOptions}
          disabled={formDisabled}
        />
      </Form.Item>
    </Col>
    <Col span={24}>
      <Form.Item label="Mine manager's recommendations">
        <FieldArray
          id="recommendations"
          name="recommendations"
          disabled={formDisabled}
          component={renderRecommendations}
        />
      </Form.Item>
    </Col>
  </Row>
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

  const formDisabled = props.isReviewSubmitStage || props.isFinalReviewStage;
  const parentColumnProps = props.isFinalReviewStage ? {} : { span: 16, offset: 4 };

  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row>
        <Col {...parentColumnProps}>
          {props.isFinalReviewStage && renderIncidentStatusCallout(props)}
          {renderInitialReport(props, formDisabled)}
          <br />
          {renderReporterDetails(props, formDisabled)}
          <br />
          {renderIncidentDetails(props, formDisabled)}
          <br />
          <br />
          {renderUploadInitialNotificationDocuments(
            props,
            { onFileLoad, onRemoveFile },
            props.handlers,
            formDisabled
          )}
          {props.isFinalReviewStage && (
            <>
              <br />
              {renderMinistryFollowUp(props, formDisabled)}
            </>
          )}
          {confirmationSubmission(props)}
        </Col>
      </Row>
    </Form>
  );
};

IncidentForm.propTypes = propTypes;
IncidentForm.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  incidentCategoryCodeOptions: getDropdownIncidentCategoryCodeOptions(state),
  inspectorOptions: getDropdownInspectors(state) || [],
  incidentStatusCodeOptions: getDropdownIncidentStatusCodeOptions(state),
  incidentFollowupActionOptions: getDropdownIncidentFollowupActionOptions(state),
  formValues: getFormValues(FORM.ADD_EDIT_INCIDENT)(state) || {},
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      change,
    },
    dispatch
  );

// ENV FLAG FOR MINE INCIDENTS //
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

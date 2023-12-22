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
  maxLength,
  email,
  phoneNumber,
  number,
  dateNotInFuture,
  dateNotInFutureTZ,
  dateTimezoneRequired,
  dateNotBeforeStrictOther,
  wholeNumber,
  requiredRadioButton,
  requiredNotUndefined,
} from "@common/utils/Validate";
import { normalizePhone, normalizeDatetime } from "@common/utils/helpers";
import * as Strings from "@mds/common/constants/strings";
import { getDropdownInspectors } from "@mds/common/redux/selectors/partiesSelectors";
import {
  getDropdownIncidentStatusCodeOptions,
  getDropdownIncidentFollowupActionOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { INCIDENT_CONTACT_METHOD_OPTIONS } from "@mds/common";
import * as FORM from "@/constants/forms";
import DocumentTable from "@/components/common/DocumentTable";
import {
  documentNameColumn,
  uploadDateColumn,
  uploadedByColumn,
} from "@/components/common/DocumentColumns";
import { renderConfig } from "@/components/common/config";
import Callout from "@/components/common/Callout";
import customPropTypes from "@/customPropTypes";
import IncidentFileUpload from "./IncidentFileUpload";
import RenderDateTimeTz from "@/components/common/RenderDateTimeTz";

const propTypes = {
  incident: customPropTypes.incident.isRequired,
  inspectorOptions: customPropTypes.groupedDropdownList.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  form: PropTypes.string.isRequired,
  handlers: PropTypes.shape({ deleteDocument: PropTypes.func }).isRequired,
  change: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  applicationSubmitted: PropTypes.bool,
  isFinalReviewStage: PropTypes.bool,
  isReviewSubmitStage: PropTypes.bool,
  setConfirmedSubmission: PropTypes.func.isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      current: PropTypes.number,
    }),
  }).isRequired,
  confirmedSubmission: PropTypes.bool,
  incidentFollowupActionOptions: customPropTypes.options.isRequired,
  incidentStatusCodeOptions: customPropTypes.options.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      mineGuid: PropTypes.string,
      mineIncidentGuid: PropTypes.string,
    }),
  }).isRequired,
};

const defaultProps = {
  applicationSubmitted: false,
  isFinalReviewStage: false,
  isReviewSubmitStage: false,
  confirmedSubmission: false,
};

export const INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD = "initial_notification_documents";
export const FINAL_REPORT_DOCUMENTS_FORM_FIELD = "final_report_documents";

const documentColumns = [documentNameColumn(), uploadDateColumn(), uploadedByColumn()];

const retrieveIncidentDetailsDynamicValidation = (childProps) => {
  const { formValues } = childProps;
  const inspectorSet = formValues?.reported_to_inspector_party_guid;
  const workerRepSet = formValues?.johsc_worker_rep_name;
  const managementRepSet = formValues?.johsc_management_rep_name;

  return {
    inspectorContactedValidation: inspectorSet ? { validate: [requiredRadioButton] } : {},
    inspectorContacted: formValues?.reported_to_inspector_contacted,
    workerRepContactedValidation: workerRepSet ? { validate: [requiredRadioButton] } : {},
    workerRepContacted: formValues?.johsc_worker_rep_contacted,
    managementRepContactedValidation: managementRepSet ? { validate: [requiredRadioButton] } : {},
    managementRepContacted: formValues?.johsc_management_rep_contacted,
  };
};

const confirmationSubmission = (childProps) => {
  const {
    applicationSubmitted,
    location,
    confirmedSubmission,
    setConfirmedSubmission,
  } = childProps;
  return (
    !applicationSubmitted &&
    location?.state?.current === 2 && (
      <Col span={24}>
        <Card>
          <>
            <p>
              <b>Confirmation of Submission</b>
            </p>
            <p>
              <span>
                <Checkbox checked={confirmedSubmission} onChange={setConfirmedSubmission} />
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
    )
  );
};

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
          "This incident has not yet been reviewed by Ministry staff. You will be notified if further clarification is required.",
        title: "This Incident is Pending Ministry Review",
        severity: Strings.CALLOUT_SEVERITY.warning,
      };
    case "INV":
      return {
        message:
          "This incident has been reviewed and is currently under investigation. You will be notified if further clarification is required.",
        title: "This Incident is Under Investigation",
        severity: Strings.CALLOUT_SEVERITY.warning,
      };
    case "UNR":
      return {
        message:
          "This incident has been reviewed and is currently under investigation. You will be notified if further clarification is required.",
        title: "This Incident is Under Investigation",
        severity: Strings.CALLOUT_SEVERITY.warning,
      };
    case "MIU":
      return {
        message:
          "This incident has been reviewed and is currently under investigation. You will be notified if further clarification is required.",
        title: "This Incident is Under Investigation",
        severity: Strings.CALLOUT_SEVERITY.warning,
      };
    case "CLD":
      return {
        message: "This incident has been reviewed and has been closed.",
        title: "This Incident Has Been Closed",
        severity: Strings.CALLOUT_SEVERITY.warning,
      };
    case "RSS":
      return {
        message:
          "The severity of this incident's status is currently under review by Ministry staff. You will be notified if further information is required.",
        title: "This Incident's Severity Status is being Reviewed",
        severity: Strings.CALLOUT_SEVERITY.warning,
      };
    case "IMS":
      return {
        message:
          "This incident is missing critical information, please refer to your communications with Ministry staff and resubmit with additional information.",
        title: "This Incident is Missing Information",
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
  const { incident } = childProps;
  const { title, message, severity } = incidentStatusCalloutContent(incident?.status_code);

  return (
    <Callout
      message={
        <div>
          <h4 id="initial-report" style={{ color: "#313132", fontWeight: 700 }}>
            {title}
          </h4>
          <p>{message}</p>
        </div>
      }
      severity={severity}
    />
  );
};

const renderReporterDetails = (formDisabled) => {
  return (
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
        <Form.Item label="* Email">
          <Field
            id="reported_by_email"
            name="reported_by_email"
            placeholder="example@domain.com"
            component={renderConfig.FIELD}
            validate={[required, email]}
            disabled={formDisabled}
            blockLabelText={
              "Notification of record creation and updates will be sent to this address"
            }
          />
        </Form.Item>
      </Col>
    </Row>
  );
};

const renderIncidentDetails = (childProps) => {
  const { formValues, formDisabled } = childProps;
  const {
    workerRepContactedValidation,
    workerRepContacted,
    managementRepContactedValidation,
    managementRepContacted,
  } = retrieveIncidentDetailsDynamicValidation({ formValues });

  const showUnspecified = formDisabled && !formValues.incident_location;
  const locationOptions = [
    { label: "Surface", value: "surface" },
    { label: "Underground", value: "underground" },
    ...(showUnspecified ? [{ label: "Not Specified", value: "" }] : []),
  ];

  return (
    <Row gutter={[16]}>
      <Col span={24}>
        <Typography.Title level={4} id="incident-details">
          Incident Details
        </Typography.Title>
        <Typography.Paragraph>
          Enter more information regarding the reported incident. Some fields may be marked as
          optional but help the ministry understand the nature of the incident, please consider
          including them.
        </Typography.Paragraph>
      </Col>
      <Col span={24}>
        <Form.Item label="Incident Location">
          <Field
            id="incident_location"
            name="incident_location"
            disabled={formDisabled}
            component={renderConfig.RADIO}
            validate={[requiredRadioButton]}
            customOptions={locationOptions}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item label="Incident date and time">
          <Field
            id="incident_timestamp"
            name="incident_timestamp"
            disabled={formDisabled}
            validate={[dateNotInFutureTZ, required, dateTimezoneRequired("incident_timezone")]}
            normalize={normalizeDatetime}
            component={RenderDateTimeTz}
            props={{ timezoneFieldProps: { name: "incident_timezone" } }}
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
        <Form.Item label="Was verbal notification of the incident provided through the Mine Incident Reporting Line (1-888-348-0299)?">
          <Field
            id="verbal_notification_provided"
            name="verbal_notification_provided"
            component={renderConfig.RADIO}
            disabled={formDisabled}
            validate={[requiredNotUndefined]}
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
                component={RenderDateTimeTz}
                normalize={normalizeDatetime}
                timezone={formValues.incident_timezone}
                showTime
                disabled={formDisabled}
                placeholder="Please select date and time"
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
                normalize={normalizeDatetime}
                component={RenderDateTimeTz}
                timezone={formValues.incident_timezone}
                showTime
                disabled={formDisabled}
                placeholder="Please select date and time"
                validate={[
                  required,
                  dateNotInFutureTZ,
                  dateNotBeforeStrictOther(formValues.incident_timestamp),
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
  const { formValues, isFinalReviewStage, match } = childProps;
  const { mine_guid: mineGuid, mine_incident_guid: mineIncidentGuid } = formValues;
  const title = isFinalReviewStage ? "Documentation" : "Record Files";
  const subTitle = isFinalReviewStage ? "Incident Documents" : "Initial Notification Documents";

  const formValuesDocumentsInitial = formValues?.documents
    ? formValues?.documents?.filter(
        (doc) => doc.mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.initial
      )
    : [];

  const formValuesDocumentsFinalReport =
    formValues?.documents?.filter(
      (doc) => doc.mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.final
    ) ?? [];

  const formValuesInitialNotificationDocs = formValues?.initial_notification_documents
    ? formValues?.initial_notification_documents?.filter(
        (doc) => doc.mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.initial
      )
    : [];

  const formValuesFinaltReportDocs = formValues?.final_report_documents
    ? formValues?.final_report_documents?.filter(
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

  const notInitialDocumentsInForm = !formValues?.documents || initialDocumentsForm.length === 0;

  const notFinalReportInForm = !formValues?.documents || finalReportDocumentsForm.length === 0;

  return (
    <Row>
      {formDisabled && (
        <Typography.Title level={3} id="documentation">
          {title}
        </Typography.Title>
      )}
      {notInitialDocumentsInForm && !isFinalReviewStage && (
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
                  )
                }
                onRemoveFile={parentHandlers?.deleteDocument}
                mineGuid={match.params?.mineGuid}
                component={IncidentFileUpload}
                labelIdle='<strong class="filepond--label-action">Drag & drop your files or Browse</strong><div>Accepted filetypes: .kmz .doc .docx .xlsx .pdf .msg .png .jpeg .tiff .hiec</div>'
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
          {(formValuesDocumentsInitial?.length > 0 || isFinalReviewStage) && (
            <Col xs={24} md={12}>
              <div className="right center-mobile">
                <Button
                  id="mine-incident-add-documentation"
                  type="secondary"
                  onClick={(e) =>
                    parentHandlers.openUploadIncidentDocumentsModal(
                      e,
                      Strings.INCIDENT_DOCUMENT_TYPES.initial
                    )
                  }
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
            handleDeleteDocument={handlers.deleteDocument}
            deletePayload={{ mineGuid, mineIncidentGuid }}
            deletePermission
          />
        )}

        {notFinalReportInForm && !isFinalReviewStage && (
          <>
            <Col span={24}>
              <Typography.Title level={4}>Upload Final Report</Typography.Title>
              <Typography.Paragraph>
                Please upload the final report that support this written incident notification. You
                may return later to upload additional documents as needed.
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
                    )
                  }
                  onRemoveFile={parentHandlers?.deleteDocument}
                  mineGuid={match.params?.mineGuid}
                  component={IncidentFileUpload}
                  labelIdle='<strong class="filepond--label-action">Final Report Upload</strong><div>Accepted filetypes: .kmz .doc .docx .xlsx .pdf .msg .png .jpeg .tiff .hiec</div>'
                />
              </Form.Item>
            </Col>
          </>
        )}
        <Row>
          <Col xs={24} md={12}>
            <Typography.Title level={4} id="final-report">
              Final Report Documents
            </Typography.Title>
          </Col>
          {(formValuesDocumentsFinalReport?.length > 0 || isFinalReviewStage) && (
            <Col xs={24} md={12}>
              <div className="right center-mobile">
                <Button
                  type="primary"
                  onClick={(e) =>
                    parentHandlers.openUploadIncidentDocumentsModal(
                      e,
                      Strings.INCIDENT_DOCUMENT_TYPES.final
                    )
                  }
                  className="full-mobile violet violet-border"
                >
                  + Add Final Report
                </Button>
              </div>
            </Col>
          )}
        </Row>
        <Row>
          <Typography.Paragraph>
            A final report must be submitted within 60 days of the reportable incident. Please add
            the final report documentation below.
          </Typography.Paragraph>
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
            handleDeleteDocument={handlers.deleteDocument}
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
    return [
      <Field
        key="default"
        name="recommendations"
        component={renderConfig.AUTO_SIZE_FIELD}
        disabled
      />,
    ];
  }
  return [
    fields.map((recommendation) => (
      <Field
        key={recommendation}
        name={`${recommendation}.recommendation`}
        component={renderConfig.AUTO_SIZE_FIELD}
        disabled
      />
    )),
  ];
};

const renderMinistryFollowUp = (childProps, formDisabled, formValues) => {
  const { incidentFollowupActionOptions, incidentStatusCodeOptions } = childProps;
  return (
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
            normalize={normalizeDatetime}
            component={RenderDateTimeTz}
            timezone={formValues.incident_timezone}
            showTime={false}
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
            data={incidentFollowupActionOptions}
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
            data={incidentStatusCodeOptions}
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
};

export const IncidentForm = (props) => {
  const {
    setConfirmedSubmission,
    confirmedSubmission,
    applicationSubmitted,
    location,
    formValues,
    incidentFollowupActionOptions,
    incidentStatusCodeOptions,
    isFinalReviewStage,
    isReviewSubmitStage,
    incident,
    match,
    handlers,
  } = props;
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onFileLoad = (fileName, document_manager_guid, documentTypeCode, documentFormField) => {
    const updatedUploadedFiles = [
      ...uploadedFiles,
      {
        document_name: fileName,
        document_manager_guid,
        mine_incident_document_type_code: documentTypeCode,
        mine_guid: formValues.mine_guid,
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
  const formDisabled = isReviewSubmitStage || isFinalReviewStage;
  const parentColumnProps = isFinalReviewStage ? {} : { span: 16, offset: 4 };

  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row>
        <Col {...parentColumnProps}>
          {renderIncidentStatusCallout({ incident })}
          <br />
          {renderReporterDetails(formDisabled)}
          <br />
          {renderIncidentDetails({ formValues, formDisabled })}
          <br />
          <br />
          {renderUploadInitialNotificationDocuments(
            { formValues, isFinalReviewStage, match, handlers },
            { onFileLoad, onRemoveFile },
            props.handlers,
            formDisabled
          )}
          {isFinalReviewStage && (
            <>
              <br />
              {renderMinistryFollowUp(
                { incidentFollowupActionOptions, incidentStatusCodeOptions },
                formDisabled,
                formValues
              )}
            </>
          )}
          {confirmationSubmission({
            applicationSubmitted,
            location,
            confirmedSubmission,
            setConfirmedSubmission,
          })}
        </Col>
      </Row>
    </Form>
  );
};

IncidentForm.propTypes = propTypes;
IncidentForm.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
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

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.ADD_EDIT_INCIDENT,
    enableReinitialize: true,
    touchOnBlur: true,
    touchOnChange: true,
  })
)(IncidentForm);

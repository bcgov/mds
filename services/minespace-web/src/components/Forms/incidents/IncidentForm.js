import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import { Field, reduxForm, change, getFormValues, FieldArray } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Card, Checkbox, Col, Row, Typography, Divider, Empty, Button } from "antd";
import {
  required,
  requiredList,
  maxLength,
  email,
  phoneNumber,
  number,
  dateNotInFuture,
  dateNotBeforeStrictOther,
  timeNotBeforeOther,
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
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import * as FORM from "@/constants/forms";
import * as Permission from "@/constants/permissions";
import { INCIDENT_CONTACT_METHOD_OPTIONS } from "@/constants/strings";
import DocumentTable from "@/components/common/DocumentTable";
import { uploadDateColumn, uploadedByColumn } from "@/components/common/DocumentColumns";
import { renderConfig } from "@/components/common/config";
import Callout from "@/components/common/Callout";
import customPropTypes from "@/customPropTypes";
import IncidentFileUpload from "./IncidentFileUpload";

const propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  incident: customPropTypes.incident.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  inspectorOptions: customPropTypes.groupedDropdownList.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  handlers: PropTypes.shape({ deleteDocument: PropTypes.func }).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  incidentCategoryCodeOptions: customPropTypes.options.isRequired,
  change: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  applicationSubmitted: PropTypes.bool,
  // eslint-disable-next-line react/no-unused-prop-types
  isReviewSubmitStage: PropTypes.bool,
  isFinalReviewStage: PropTypes.bool,
};

const defaultProps = {
  applicationSubmitted: false,
  isReviewSubmitStage: false,
  isFinalReviewStage: false,
};

export const INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD = "initial_notification_documents";
export const FINAL_REPORT_DOCUMENTS_FORM_FIELD = "final_report_documents";

const documentColumns = [
  uploadedByColumn("Uploader", "update_user"),
  uploadDateColumn("upload_date"),
];

const retrieveIncidentDetailsDynamicValidation = (props) => {
  const inspectorSet = props.formValues?.reported_to_inspector_party_guid;
  const workerRepSet = props.formValues?.johsc_worker_rep_name;
  const managementRepSet = props.formValues?.johsc_management_rep_name;

  return {
    inspectorContactedValidation: inspectorSet ? { validate: [requiredRadioButton] } : {},
    inspectorContacted: props.formValues?.reported_to_inspector_contacted,
    workerRepContactedValidation: workerRepSet ? { validate: [requiredRadioButton] } : {},
    workerRepContacted: props.formValues?.johsc_worker_rep_contacted,
    managementRepContactedValidation: managementRepSet ? { validate: [requiredRadioButton] } : {},
    managementRepContacted: props.formValues?.johsc_management_rep_contacted,
  };
};

const confirmationSubmission = (props) =>
  props.isReviewSubmitStage &&
  !props.applicationSubmitted &&
  props.formValues?.status_code === "DFT" && (
    <Col span={24}>
      <Card>
        <>
          <p>
            <b>Confirmation of Submission</b>
          </p>
          <p>
            <span>
              <Checkbox
                checked={props.confirmedSubmission}
                onChange={props.setConfirmedSubmission}
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
          "You determined that this incident was a dangerous occurence please provide investigation documentation in the final documentation section.",
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

const renderIncidentStatusCallout = (props) => {
  const { status_code } = props.incident;
  const { title, message, severity } = incidentStatusCalloutContent(status_code);

  return (
    <Callout
      message={
        <div>
          <h4 style={{ color: "#313132", fontWeight: 700 }}>{title}</h4>
          <p>{message}</p>
        </div>
      }
      severity={severity}
    />
  );
};

const renderInitialReport = (props, formDisabled) => (
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
          data={props?.incidentCategoryCodeOptions}
          disabled={formDisabled}
        />
      </Form.Item>
    </Col>
  </Row>
);

const renderReporterDetails = (props, formDisabled) => (
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

const renderIncidentDetails = (props, formDisabled) => {
  const {
    inspectorContactedValidation,
    inspectorContacted,
    workerRepContactedValidation,
    workerRepContacted,
    managementRepContactedValidation,
    managementRepContacted,
  } = retrieveIncidentDetailsDynamicValidation(props);

  const inspectorOptions = props.inspectorOptions
    ?.filter((i) => i.groupName === "Active")
    ?.flatMap((fi) => fi.opt);

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
      <Col md={12} xs={24}>
        <Form.Item label="Incident date">
          <Field
            id="incident_date"
            name="incident_date"
            placeholder="Please select date"
            component={renderConfig.DATE}
            validate={[required, dateNotInFuture]}
            disabled={formDisabled}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item label="Incident time">
          <Field
            id="incident_time"
            name="incident_time"
            placeholder="Please select time"
            component={renderConfig.TIME}
            validate={[required]}
            disabled={formDisabled}
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
          Please enter the details of any inspectors, OHSC, local union, or worker representatives
          that you have contacted
        </Typography.Paragraph>
      </Col>
      <Col span={24}>
        <Typography.Title level={5}>Inspector Information</Typography.Title>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item label="Inspector Name (optional)">
          <Field
            id="reported_to_inspector_party_guid"
            name="reported_to_inspector_party_guid"
            component={renderConfig.SELECT}
            placeholder="Enter name"
            validate={[maxLength(100)]}
            data={inspectorOptions}
            disabled={formDisabled}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item label="Has this person already been informed of the incident?">
          <Field
            id="reported_to_inspector_contacted"
            name="reported_to_inspector_contacted"
            component={renderConfig.RADIO}
            disabled={formDisabled}
            {...inspectorContactedValidation}
          />
        </Form.Item>
      </Col>
      {inspectorContacted && (
        <>
          <Col md={6} xs={24}>
            <Form.Item label="Date">
              <Field
                id="reported_to_inspector_contact_date"
                name="reported_to_inspector_contact_date"
                component={renderConfig.DATE}
                disabled={formDisabled}
                placeholder="Please select date"
                validate={[
                  required,
                  dateNotInFuture,
                  dateNotBeforeStrictOther(props.formValues.incident_date),
                ]}
              />
            </Form.Item>
          </Col>
          <Col md={6} xs={24}>
            <Form.Item label="Time">
              <Field
                id="reported_to_inspector_contact_time"
                name="reported_to_inspector_contact_time"
                component={renderConfig.TIME}
                disabled={formDisabled}
                placeholder="Please select time"
                validate={[
                  required,
                  timeNotBeforeOther(
                    props.formValues.reported_to_inspector_contact_date,
                    props.formValues.incident_date,
                    props.formValues.incident_time
                  ),
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
                disabled={formDisabled}
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </>
      )}
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
          <Col md={6} xs={24}>
            <Form.Item label="Date">
              <Field
                id="johsc_worker_rep_contact_date"
                name="johsc_worker_rep_contact_date"
                component={renderConfig.DATE}
                disabled={formDisabled}
                placeholder="Please select date"
                validate={[
                  required,
                  dateNotInFuture,
                  dateNotBeforeStrictOther(props.formValues.incident_date),
                ]}
              />
            </Form.Item>
          </Col>
          <Col md={6} xs={24}>
            <Form.Item label="Time">
              <Field
                id="johsc_worker_rep_contact_time"
                name="johsc_worker_rep_contact_time"
                component={renderConfig.TIME}
                disabled={formDisabled}
                placeholder="Please select time"
                validate={[
                  required,
                  timeNotBeforeOther(
                    props.formValues.johsc_worker_rep_contact_date,
                    props.formValues.incident_date,
                    props.formValues.incident_time
                  ),
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
          <Col md={6} xs={24}>
            <Form.Item label="Date">
              <Field
                id="johsc_management_rep_contact_date"
                name="johsc_management_rep_contact_date"
                component={renderConfig.DATE}
                disabled={formDisabled}
                placeholder="Please select date"
                validate={[
                  required,
                  dateNotInFuture,
                  dateNotBeforeStrictOther(props.formValues.incident_date),
                ]}
              />
            </Form.Item>
          </Col>
          <Col md={6} xs={24}>
            <Form.Item label="Time">
              <Field
                id="johsc_management_rep_contact_time"
                name="johsc_management_rep_contact_time"
                component={renderConfig.TIME}
                disabled={formDisabled}
                placeholder="Please select time"
                validate={[
                  required,
                  timeNotBeforeOther(
                    props.formValues.johsc_management_rep_contact_date,
                    props.formValues.incident_date,
                    props.formValues.incident_time
                  ),
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

const renderDangerousOccurenceDetermination = (formDisabled) => (
  <Row gutter={[16]}>
    <Col span={24}>
      <Typography.Title level={4}>Dangerous Occurrence Determination</Typography.Title>
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
          disabled={formDisabled}
        />
      </Form.Item>
    </Col>
    <Col md={12} xs={24}>
      <Form.Item label="Mine representative who made determination (optional)">
        <Field
          id="mine_determination_representative"
          name="mine_determination_representative"
          component={renderConfig.FIELD}
          validate={[maxLength(255)]}
          disabled={formDisabled}
        />
      </Form.Item>
    </Col>
  </Row>
);

const renderUploadInitialNotificationDocuments = (
  props,
  handlers,
  parentHandlers,
  formDisabled
) => {
  const { mine_guid: mineGuid, mine_incident_guid: mineIncidentGuid } = props.formValues;
  const title = props?.isFinalReviewStage ? "Documentation" : "Record Files";
  const subTitle = props?.isFinalReviewStage
    ? "Incident Documents"
    : "Initial Notification Documents";

  const formValuesDocumentsInitial = props.formValues?.documents
    ? props.formValues?.documents?.filter((doc) => doc.mine_incident_document_type_code === "INI")
    : [];

  const formValuesInitialNotificationDocs = props.formValues?.initial_notification_documents
    ? props.formValues?.initial_notification_documents?.filter(
        (doc) => doc.mine_incident_document_type_code === "INI"
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

  const finalReportDocuments =
    props.formValues?.documents?.filter(
      (doc) => doc.mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.final
    ) ?? [];
  const isDangerousOccurence =
    props.formValues?.mine_determination_type_code ||
    props.formValues?.determination_type_code === "DO";

  const noDocumentsInForm =
    !props.formValues?.documents || props.formValues?.documents?.length === 0;

  return (
    <Row>
      {noDocumentsInForm &&
        (!props.formValues.status_code || props.formValues.status_code === "DFT") &&
        !props.isFinalReviewStage &&
        !props.isReviewSubmitStage && (
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
                  mineGuid={props.match.params?.mineGuid}
                  component={IncidentFileUpload}
                  labelIdle='<strong class="filepond--label-action">Supporting Document Upload</strong><div>Accepted filetypes: .kmz .doc .docx .xlsx .pdf</div>'
                />
              </Form.Item>
            </Col>
          </>
        )}

      <Col span={24}>
        {formDisabled && (
          <Typography.Title level={3} id="documentation">
            {title}
          </Typography.Title>
        )}
        <Row>
          <Col xs={24} md={12}>
            <Typography.Title level={4}>{subTitle}</Typography.Title>
          </Col>
          {(props.formValues?.documents?.filter(
            (doc) => doc.mine_incident_document_type_code === "INI"
          )?.length > 0 ||
            props.isFinalReviewStage ||
            props.isReviewSubmitStage) && (
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
            handleDeleteDocument={props.handlers.deleteDocument}
            deletePayload={{ mineGuid, mineIncidentGuid }}
            deletePermission
          />
        )}
        {isDangerousOccurence && (
          <>
            <br />
            {(props.isFinalReviewStage ||
              (props.isReviewSubmitStage && finalReportDocuments.length > 0)) && (
              <Row>
                <Col xs={24} md={12}>
                  <Typography.Title id="final-report" level={4}>
                    Final Report
                  </Typography.Title>
                </Col>
                <Col xs={24} md={12}>
                  <div className="right center-mobile">
                    <Button
                      id="mine-incident-add-documentation"
                      type="secondary"
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
              </Row>
            )}

            {finalReportDocuments?.length === 0 && props.isReviewSubmitStage && (
              <Col span={24}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="center">
                      <Typography.Paragraph strong>
                        This incident requires a final investigation report.
                      </Typography.Paragraph>
                      <Typography.Paragraph>
                        You determined that this incident was a dangerous occurence. Please add your
                        final report documentation by clicking below.
                      </Typography.Paragraph>
                      <Button
                        type="primary"
                        onClick={(e) =>
                          parentHandlers.openUploadIncidentDocumentsModal(
                            e,
                            Strings.INCIDENT_DOCUMENT_TYPES.final
                          )
                        }
                      >
                        Add Final Report
                      </Button>
                    </div>
                  }
                />
              </Col>
            )}
            {(props.isReviewSubmitStage || props.isFinalReviewStage) && (
              <Col span={24}>
                <DocumentTable
                  documents={finalReportDocuments}
                  documentColumns={documentColumns}
                  documentParent="Mine Incident"
                />
              </Col>
            )}
          </>
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

const renderMinistryFollowUp = (props, formDisabled) => (
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
          data={props.incidentFollowupActionOptions}
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
          data={props.incidentStatusCodeOptions}
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
          {(props.isFinalReviewStage || props.isReviewSubmitStage) &&
            renderIncidentStatusCallout(props)}
          {renderInitialReport(props, formDisabled)}
          <br />
          {renderReporterDetails(props, formDisabled)}
          <br />
          {renderIncidentDetails(props, formDisabled)}
          <br />
          {renderDangerousOccurenceDetermination(formDisabled)}
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

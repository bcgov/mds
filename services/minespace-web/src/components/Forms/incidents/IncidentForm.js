import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import { Field, reduxForm, change, getFormValues } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Card, Checkbox, Col, Row, Typography, Divider } from "antd";
import {
  required,
  requiredList,
  maxLength,
  email,
  phoneNumber,
  number,
  dateNotInFuture,
  wholeNumber,
  requiredRadioButton,
} from "@common/utils/Validate";
import { normalizePhone } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import { getDropdownIncidentCategoryCodeOptions } from "@common/selectors/staticContentSelectors";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import * as FORM from "@/constants/forms";
import * as Permission from "@/constants/permissions";
import { INCIDENT_CONTACT_METHOD_OPTIONS } from "@/constants/strings";
import DocumentTable from "@/components/common/DocumentTable";
import { uploadDateColumn, uploadedByColumn } from "@/components/common/DocumentColumns";
import { renderConfig } from "@/components/common/config";
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
  // eslint-disable-next-line react/no-unused-prop-types
  applicationSubmitted: PropTypes.bool,
  // eslint-disable-next-line react/no-unused-prop-types
  isReviewSubmitStage: PropTypes.bool,
};

const defaultProps = {
  applicationSubmitted: false,
  isReviewSubmitStage: false,
};

const DOCUMENTS_FORM_FIELD = "initial_notification_documents";

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
  !props.formValues?.status_code && (
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
            I understand that this application and supporting files are submitted on behalf of the
            owner, agent or mine manager of this project.
            <span style={{ color: "red" }}>*</span>
          </p>
        </>
      </Card>
      <br />
    </Col>
  );

const renderInitialReport = (props) => (
  <Row>
    <Col span={24}>
      <Typography.Title level={4}>Initial Report</Typography.Title>
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
          disabled={props.isReviewSubmitStage}
        />
      </Form.Item>
    </Col>
  </Row>
);

const renderReporterDetails = (props) => (
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
          disabled={props.isReviewSubmitStage}
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
          disabled={props.isReviewSubmitStage}
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
          disabled={props.isReviewSubmitStage}
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
          disabled={props.isReviewSubmitStage}
        />
      </Form.Item>
    </Col>
  </Row>
);

const renderIncidentDetails = (props) => {
  const {
    inspectorContactedValidation,
    inspectorContacted,
    workerRepContactedValidation,
    workerRepContacted,
    managementRepContactedValidation,
    managementRepContacted,
  } = retrieveIncidentDetailsDynamicValidation(props);

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
            disabled={props.isReviewSubmitStage}
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
            disabled={props.isReviewSubmitStage}
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
            disabled={props.isReviewSubmitStage}
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
            disabled={props.isReviewSubmitStage}
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
            disabled={props.isReviewSubmitStage}
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
            disabled={props.isReviewSubmitStage}
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
            disabled={props.isReviewSubmitStage}
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
            disabled={props.isReviewSubmitStage}
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
            disabled={props.isReviewSubmitStage}
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
            data={props.inspectorOptions
              .filter((i) => i.groupName === "Active")
              .flatMap((fi) => fi.opt)}
            disabled={props.isReviewSubmitStage}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item label="Has this person already been informed of the incident?">
          <Field
            id="reported_to_inspector_contacted"
            name="reported_to_inspector_contacted"
            component={renderConfig.RADIO}
            disabled={props.isReviewSubmitStage}
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
                disabled={props.isReviewSubmitStage}
                placeholder="Please select date"
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
          </Col>
          <Col md={6} xs={24}>
            <Form.Item label="Time">
              <Field
                id="reported_to_inspector_contact_time"
                name="reported_to_inspector_contact_time"
                component={renderConfig.TIME}
                disabled={props.isReviewSubmitStage}
                placeholder="Please select time"
                validate={[required]}
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
                disabled={props.isReviewSubmitStage}
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
            disabled={props.isReviewSubmitStage}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item label="Has this person already been informed of the incident?">
          <Field
            id="johsc_worker_rep_contacted"
            name="johsc_worker_rep_contacted"
            component={renderConfig.RADIO}
            disabled={props.isReviewSubmitStage}
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
                disabled={props.isReviewSubmitStage}
                placeholder="Please select date"
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
          </Col>
          <Col md={6} xs={24}>
            <Form.Item label="Time">
              <Field
                id="johsc_worker_rep_contact_time"
                name="johsc_worker_rep_contact_time"
                component={renderConfig.TIME}
                disabled={props.isReviewSubmitStage}
                placeholder="Please select time"
                validate={[required]}
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
                disabled={props.isReviewSubmitStage}
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
            disabled={props.isReviewSubmitStage}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item label="Has this person already been informed of the incident?">
          <Field
            id="johsc_management_rep_contacted"
            name="johsc_management_rep_contacted"
            component={renderConfig.RADIO}
            disabled={props.isReviewSubmitStage}
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
                disabled={props.isReviewSubmitStage}
                placeholder="Please select date"
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
          </Col>
          <Col md={6} xs={24}>
            <Form.Item label="Time">
              <Field
                id="johsc_management_rep_contact_time"
                name="johsc_management_rep_contact_time"
                component={renderConfig.TIME}
                disabled={props.isReviewSubmitStage}
                placeholder="Please select time"
                validate={[required]}
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
                disabled={props.isReviewSubmitStage}
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </>
      )}
    </Row>
  );
};

const renderDangerousOccurenceDetermination = (props) => (
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
          disabled={props.isReviewSubmitStage}
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
          disabled={props.isReviewSubmitStage}
        />
      </Form.Item>
    </Col>
  </Row>
);

const renderUploadInitialNotificationDocuments = (props, handlers, parentHandlers) => {
  const { mine_guid: mineGuid, mine_incident_guid: mineIncidentGuid } = props.formValues;
  return (
    <Row>
      {!props.isReviewSubmitStage && (
        <>
          <Col span={24}>
            <Typography.Title level={4}>Upload Initial Notification Documents</Typography.Title>
            <Typography.Paragraph>
              Please upload any initial notifications that will provide context with this incident
              report.
            </Typography.Paragraph>
          </Col>
          <Col span={24}>
            <Form.Item>
              <Field
                id={DOCUMENTS_FORM_FIELD}
                name={DOCUMENTS_FORM_FIELD}
                onFileLoad={(document_name, document_manager_guid) =>
                  handlers.onFileLoad(
                    document_name,
                    document_manager_guid,
                    Strings.INCIDENT_DOCUMENT_TYPES.initial
                  )
                }
                onRemoveFile={parentHandlers?.deleteDocument}
                mineGuid={props.match.params?.mineGuid}
                component={IncidentFileUpload}
              />
            </Form.Item>
          </Col>
        </>
      )}
      {props.formValues?.documents?.length > 0 && (
        <Col span={24}>
          {props.isReviewSubmitStage && <Typography.Title level={3}>Record Files</Typography.Title>}
          <Typography.Title level={4}>Initial Notification Documents</Typography.Title>
          {props.isReviewSubmitStage && (
            <DocumentTable
              documents={props.formValues?.documents}
              documentColumns={documentColumns}
              documentParent="Mine Incident"
            />
          )}
          {!props.isReviewSubmitStage && (
            <DocumentTable
              documents={props.formValues?.documents}
              documentColumns={documentColumns}
              documentParent="Mine Incident"
              handleDeleteDocument={props.handlers.deleteDocument}
              deletePayload={{ mineGuid, mineIncidentGuid }}
              deletePermission
            />
          )}
        </Col>
      )}
    </Row>
  );
};

export const IncidentForm = (props) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onFileLoad = (fileName, document_manager_guid, documentTypeCode) => {
    const updatedUploadedFiles = [
      ...uploadedFiles,
      {
        document_name: fileName,
        document_manager_guid,
        mine_incident_document_type_code: documentTypeCode,
      },
    ];
    setUploadedFiles(updatedUploadedFiles);

    return props.change(DOCUMENTS_FORM_FIELD, updatedUploadedFiles);
  };
  const onRemoveFile = (err, fileItem) => {
    const updatedUploadedFiles = uploadedFiles.filter(
      (doc) => doc.document_manager_guid !== fileItem.serverId
    );
    setUploadedFiles(updatedUploadedFiles);

    return props.change(DOCUMENTS_FORM_FIELD, updatedUploadedFiles);
  };

  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row>
        <Col span={16} offset={4}>
          {renderInitialReport(props)}
          <br />
          {renderReporterDetails(props)}
          <br />
          {renderIncidentDetails(props)}
          <br />
          {renderDangerousOccurenceDetermination(props)}
          <br />
          {renderUploadInitialNotificationDocuments(
            props,
            { onFileLoad, onRemoveFile },
            props.handlers
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

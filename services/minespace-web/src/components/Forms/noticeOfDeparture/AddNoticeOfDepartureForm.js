import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { change, Field, reduxForm, FieldArray, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { Button, Col, Popconfirm, Row, Typography } from "antd";
import { Form } from "@ant-design/compatible";
import {
  maxLength,
  required,
  requiredList,
  requiredRadioButton,
  validateSelectOptions,
  phoneNumber,
  email,
} from "@common/utils/Validate";
import { resetForm, normalizePhone } from "@common/utils/helpers";
import { NOTICE_OF_DEPARTURE_DOCUMENT_TYPE, NOD_TYPE_FIELD_VALUE } from "@common/constants/strings";
import { compose } from "redux";
import { NOTICE_OF_DEPARTURE_DOWNLOAD_LINK } from "@/constants/strings";
import { DOCUMENT, EXCEL, SPATIAL } from "@/constants/fileTypes";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import NoticeOfDepartureFileUpload from "@/components/Forms/noticeOfDeparture/NoticeOfDepartureFileUpload";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";

const propTypes = {
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const renderContacts = (props) => {
  const { fields, formValues } = props;
  if (fields.length > 0 && formValues.nod_type === NOD_TYPE_FIELD_VALUE.NON_SUBSTANTIAL) {
    fields.pop();
  } else if (fields.length < 1 && formValues.nod_type !== NOD_TYPE_FIELD_VALUE.NON_SUBSTANTIAL) {
    fields.push({ is_primary: true });
  }
  return (
    <div className="margin-large--bottom">
      {fields.length > 0 && (
        <Typography.Title level={5} className="nod-modal-section-header">
          Primary Contact
        </Typography.Title>
      )}
      {fields.map((contact, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Row gutter={16} key={index}>
          <Col span={12}>
            <Form.Item label="First Name">
              <Field
                id={`${contact}.first_name`}
                name={`${contact}.first_name`}
                placeholder="First Name"
                component={renderConfig.FIELD}
                validate={[required, maxLength(200)]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Last Name">
              <Field
                id={`${contact}.last_name`}
                name={`${contact}.last_name`}
                placeholder="Last Name"
                component={renderConfig.FIELD}
                validate={[required, maxLength(200)]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Field
              name={`${contact}.phone_number`}
              id={`${contact}.phone_number`}
              label="Phone Number"
              placeholder="XXX-XXX-XXXX"
              component={renderConfig.FIELD}
              validate={[phoneNumber, maxLength(12), required]}
              normalize={normalizePhone}
            />
          </Col>
          <Col span={12}>
            <Form.Item label="Email">
              <Field
                id={`${contact}.email`}
                name={`${contact}.email`}
                component={renderConfig.FIELD}
                placeholder="example@example.com"
                validate={[email, required]}
              />
            </Form.Item>
          </Col>
        </Row>
      ))}
    </div>
  );
};

const AddNoticeOfDepartureForm = (props) => {
  const { permits, onSubmit, closeModal, handleSubmit, mineGuid, formValues } = props;
  const [submitting, setSubmitting] = useState(false);
  const [hasChecklist, setHasChecklist] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [permitOptions, setPermitOptions] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [documentArray, setDocumentArray] = useState([]);

  useEffect(() => {
    if (permits.length > 0) {
      setPermitOptions(
        permits.map((permit) => ({
          label: permit.permit_no,
          value: permit.permit_guid,
        }))
      );
    }
    change("uploadedFiles", []);
  }, []);

  const handleNoticeOfDepartureSubmit = (values) => {
    setSubmitting(true);
    const { permitNumber } = values;
    onSubmit(permitNumber, values, documentArray).finally(() => setSubmitting(false));
  };

  const onFileLoad = (documentName, document_manager_guid, documentType) => {
    setUploadedFiles([
      ...uploadedFiles,
      {
        documentType,
        documentName,
        document_manager_guid,
      },
    ]);
    setDocumentArray([
      ...documentArray,
      {
        document_type: documentType,
        document_name: documentName,
        document_manager_guid,
      },
    ]);
    if (documentType === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST) {
      setHasChecklist(true);
    }
  };

  useEffect(() => {
    change("uploadedFiles", documentArray);
  }, [documentArray]);

  const onRemoveFile = (_, fileItem) => {
    const removedDoc = documentArray.find((doc) => doc.document_manager_guid === fileItem.serverId);
    if (removedDoc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST) {
      setHasChecklist(false);
    }
    setDocumentArray(
      documentArray.filter((document) => document.document_manager_guid !== fileItem.serverId)
    );
    setUploadedFiles(
      uploadedFiles.filter((file) => file.document_manager_guid !== fileItem.serverId)
    );
  };

  return (
    <div>
      <Form layout="vertical" onSubmit={handleSubmit(handleNoticeOfDepartureSubmit)}>
        <Typography.Text>
          Please complete the following form to submit your Notice of Departure and any relevant
          supporting documents. For more information on the purpose and intent of a Notice of
          Departure{" "}
          <a
            href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/mines-act-permits/mines-act-departures-from-approval"
            target="_blank"
            rel="noreferrer"
          >
            Click Here
          </a>
          .
        </Typography.Text>
        <h4 className="nod-modal-section-header">Basic Information</h4>
        <div className="margin-large--bottom">
          <Typography.Text>
            Enter the following information about your Notice of Departure.
          </Typography.Text>
        </div>
        <Form.Item label="Departure Project Title">
          <Field
            id="nodTitle"
            name="nod_title"
            placeholder="Departure Project Title"
            component={renderConfig.FIELD}
            validate={[required, maxLength(50)]}
          />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Permit #">
              <Field
                id="permitGuid"
                name="permit_guid"
                placeholder="Select Permit #"
                component={renderConfig.SELECT}
                validate={[requiredList, validateSelectOptions(permitOptions)]}
                data={permitOptions}
              />
            </Form.Item>
          </Col>
        </Row>
        <Field
          id="nod_description"
          name="nod_description"
          label="Departure Summary"
          component={renderConfig.AUTO_SIZE_FIELD}
          validate={[maxLength(3000), required]}
        />
        <FieldArray name="nod_contacts" component={renderContacts} props={{ formValues }} />
        <h4 className="nod-modal-section-header">
          Notice of Departure Self-Assessment Determination
        </h4>
        <Form.Item>
          <Field
            id="nod_type"
            name="nod_type"
            label="Based on the information established in your self-assessment form please determine your
          submissions Notice of Departure type. If you are unsure what category you fall under,
          please contact us."
            component={RenderRadioButtons}
            validate={[requiredRadioButton]}
            customOptions={[
              {
                value: NOD_TYPE_FIELD_VALUE.NON_SUBSTANTIAL,
                label:
                  "This Notice of Departure is non-substantial and does not require ministry review.  (Proponent is responsible for ensuring all details have been completed correctly for submission and can begin work immediately)",
              },
              {
                value: NOD_TYPE_FIELD_VALUE.POTENTIALLY_SUBSTANTIAL,
                label:
                  "This Notice of Departure is potentially substantial and requires ministry review.  (Ministry staff will review submission and determine if work can move forward as Notice of Departure)",
              },
            ]}
          />
        </Form.Item>
        <h4 className="nod-modal-section-header">
          Upload Notice of Departure Self-Assessment Form
        </h4>
        <Typography.Text>
          Please upload your completed Self-assessment form (
          <a href={NOTICE_OF_DEPARTURE_DOWNLOAD_LINK} target="_blank" rel="noreferrer">
            click here to download
          </a>
          ) below. Remember your completed form must be signed by the Mine Manager and any
          supporting information included or uploaded.
        </Typography.Text>
        <Form.Item className="margin-y-large">
          <Field
            onFileLoad={(documentName, document_manager_guid) => {
              onFileLoad(
                documentName,
                document_manager_guid,
                NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST
              );
            }}
            onRemoveFile={onRemoveFile}
            mineGuid={mineGuid}
            setUploading={setUploading}
            allowMultiple
            component={NoticeOfDepartureFileUpload}
            maxFiles={1}
            labelIdle='<strong class="filepond--label-action">Self-Assessment Upload</strong><div>Accepted filetypes: .doc .docx .xlsx .pdf</div>'
            acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
            uploadType={NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST}
            validate={[required]}
          />
        </Form.Item>
        <h4 className="nod-modal-section-header">Upload Application Documents</h4>
        <Typography.Text>
          Please support your Notice of Departure by uploading additional supporting application
          documents. These items documents can include:
        </Typography.Text>
        <ul>
          <li>A detailed project description</li>
          <li>Location (with map, showing Mine boundary)</li>
          <li>Total disturbance area</li>
          <li>Total new disturbance area</li>
          <li>Relevant supporting info (management plans, field surveys, etc...)</li>
        </ul>
        <Form.Item className="margin-y-large">
          <Field
            onFileLoad={(documentName, document_manager_guid) => {
              onFileLoad(
                documentName,
                document_manager_guid,
                NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.OTHER
              );
            }}
            onRemoveFile={onRemoveFile}
            mineGuid={mineGuid}
            allowMultiple
            component={NoticeOfDepartureFileUpload}
            setUploading={setUploading}
            labelIdle='<strong class="filepond--label-action">Supporting Document Upload</strong><div>Accepted filetypes: .kmz .doc .docx .xlsx .pdf</div>'
            acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL, ...SPATIAL }}
            uploadType={NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.OTHER}
            validate={[required]}
          />
        </Form.Item>
        <div className="ant-modal-footer">
          <Popconfirm
            placement="top"
            title="Are you sure you want to cancel?"
            okText="Yes"
            cancelText="No"
            onConfirm={closeModal}
            disabled={submitting}
          >
            <Button disabled={submitting}>Cancel</Button>
          </Popconfirm>
          <Button
            disabled={submitting || !hasChecklist || uploading}
            type="primary"
            className="full-mobile margin-small"
            htmlType="submit"
          >
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};

AddNoticeOfDepartureForm.propTypes = propTypes;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.ADD_NOTICE_OF_DEPARTURE)(state) || {},
  })),
  reduxForm({
    form: FORM.ADD_NOTICE_OF_DEPARTURE,
    onSubmitSuccess: resetForm(FORM.ADD_NOTICE_OF_DEPARTURE),
    initialValues: { nod_contacts: [{ is_primary: true }] },
    touchOnBlur: false,
    forceUnregisterOnUnmount: true,
    enableReinitialize: true,
  })
)(AddNoticeOfDepartureForm);

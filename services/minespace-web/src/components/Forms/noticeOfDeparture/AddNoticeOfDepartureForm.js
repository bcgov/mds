import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { change, Field, reduxForm } from "redux-form";
import { Button, Col, Popconfirm, Row, Typography } from "antd";
import { Form } from "@ant-design/compatible";
import {
  maxLength,
  required,
  requiredList,
  validateSelectOptions,
  requiredRadioButton,
} from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import { NOTICE_OF_DEPARTURE_DOCUMENT_TYPE } from "@common/constants/strings";
import { NOD_TYPE_FIELD_VALUE, NOTICE_OF_DEPARTURE_DOWNLOAD_LINK } from "@/constants/strings";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";
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
};

const AddNoticeOfDepartureForm = (props) => {
  const { permits, onSubmit, closeModal, handleSubmit, mineGuid } = props;
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
    setUploading(false);
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
          Please complete the following form to submit your notice of departure and any relevant
          supporting documents. For more information on the purpose and intent of a notice of
          departure click here.
        </Typography.Text>
        <h4 className="nod-modal-section-header">Basic Information</h4>
        <Typography.Text>
          Enter the following information about your notice of departure.
        </Typography.Text>
        <Form.Item label="Project Title">
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
          label="Description"
          component={renderConfig.AUTO_SIZE_FIELD}
          validate={[maxLength(3000), required]}
        />
        <h4 className="nod-modal-section-header">
          Notice of Departure Self-Assessment Determination
        </h4>
        <Form.Item>
          <Field
            id="nod_type"
            name="nod_type"
            label="Based on the information established in your self-assessment form please determine your
          submissions notice of departure type. If you are unsure what category you fall under,
          please contact us."
            component={RenderRadioButtons}
            validate={[requiredRadioButton]}
            customOptions={[
              {
                value: NOD_TYPE_FIELD_VALUE.NON_SUBSTANTIAL,
                label:
                  "This notice of departure is non-substantial and does not require ministry review.  (Proponent is responsible for ensuring all details have been completed correctly for submission and can begin work immediately)",
              },
              {
                value: NOD_TYPE_FIELD_VALUE.POTENTIALLY_SUBSTANTIAL,
                label:
                  "This notice of departure is potentially substantial and requires ministry review.  (Ministry staff will review submission and determine if work can move forward as notice of departure)",
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
            acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
            uploadType={NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST}
            validate={[required]}
          />
        </Form.Item>
        <h4 className="nod-modal-section-header">Upload Application Documents</h4>
        <Typography.Text>
          Please support your notice of departure by uploading additional supporting application
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
            onProcessFileStart={() => setUploading(true)}
            onProcessFiles={() => setUploading(false)}
            component={NoticeOfDepartureFileUpload}
            setUploading={setUploading}
            acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
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

export default reduxForm({
  form: FORM.ADD_NOTICE_OF_DEPARTURE,
  onSubmitSuccess: resetForm(FORM.ADD_NOTICE_OF_DEPARTURE),
  destroyOnUnmount: true,
  forceUnregisterOnUnmount: true,
  touchOnBlur: true,
})(AddNoticeOfDepartureForm);

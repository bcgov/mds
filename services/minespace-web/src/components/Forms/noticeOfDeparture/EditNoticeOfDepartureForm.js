import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { change, Field, reduxForm } from "redux-form";
import { Button, Col, Popconfirm, Row, Typography } from "antd";
import { Form } from "@ant-design/compatible";
import { maxLength, required, requiredRadioButton } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import { NOTICE_OF_DEPARTURE_DOCUMENT_TYPE } from "@common/constants/strings";
import { getNoticeOfDeparture } from "@common/reducers/noticeOfDepartureReducer";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { DOCUMENT, EXCEL, SPATIAL } from "@/constants/fileTypes";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import NoticeOfDepartureFileUpload from "@/components/Forms/noticeOfDeparture/NoticeOfDepartureFileUpload";
import { EMPTY_FIELD, NOD_TYPE_FIELD_VALUE } from "@/constants/strings";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import { formatDate } from "@/utils/helpers";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  mineGuid: PropTypes.string.isRequired,
  noticeOfDeparture: CustomPropTypes.noticeOfDeparture.isRequired,
};

// eslint-disable-next-line import/no-mutable-exports
let EditNoticeOfDepartureForm = (props) => {
  const { onSubmit, closeModal, handleSubmit, mineGuid, noticeOfDeparture, pristine } = props;
  const { permit, nod_guid } = noticeOfDeparture;
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [documentArray, setDocumentArray] = useState([]);
  const [uploading, setUploading] = useState(false);

  const checklist = noticeOfDeparture.documents.find(
    (doc) => doc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST
  );

  const otherDocuments = noticeOfDeparture.documents.filter(
    (doc) => doc.document_type !== NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST
  );

  const handleNoticeOfDepartureSubmit = (values) => {
    setSubmitting(true);
    onSubmit(nod_guid, values, documentArray).finally(() => setSubmitting(false));
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
  };

  useEffect(() => {
    change("uploadedFiles", documentArray);
  }, [documentArray]);

  const onRemoveFile = (_, fileItem) => {
    setDocumentArray(
      documentArray.filter((document) => document.document_manager_guid !== fileItem.serverId)
    );
    setUploadedFiles(
      uploadedFiles.filter((file) => file.document_manager_guid !== fileItem.serverId)
    );
    setUploading(false);
  };

  return (
    <div>
      <Form layout="vertical" onSubmit={handleSubmit(handleNoticeOfDepartureSubmit)}>
        <Typography.Text>
          Please complete the following form to submit your notice of departure and any relevant
          supporting documents. For more information on the purpose and intent of a notice of
          departure click here.
        </Typography.Text>
        <Typography.Title level={4}>Basic Information</Typography.Title>
        <Typography.Text>
          Enter the following information about your notice of departure.
        </Typography.Text>
        <Form.Item label="Project Title">
          <Field
            id="nodTitle"
            name="nod_title"
            component={renderConfig.FIELD}
            validate={[required, maxLength(50)]}
          />
        </Form.Item>
        <Row gutter={24}>
          <Col span={12}>
            <p className="field-title">Permit #</p>
            <p className="content--light-grey padding-sm">{permit.permit_no || EMPTY_FIELD}</p>
          </Col>
          <Col span={12}>
            <p className="field-title">NOD #</p>
            <p className="content--light-grey padding-sm">{nod_guid || EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Field
          id="nod_description"
          name="nod_description"
          label="Departure Summary"
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
          <a
            href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/mines-act-permits/mines-act-departures-from-approval"
            target="_blank"
            rel="noreferrer"
          >
            click here to download
          </a>
          ) below. Remember your completed form must be signed by the Mine Manager and any
          supporting information included or uploaded.
        </Typography.Text>
        <Form.Item className="margin-y-large">
          <Field
            name="nod_self_assessment_form"
            id="nod_self_assessment_form"
            onFileLoad={(documentName, document_manager_guid) => {
              onFileLoad(
                documentName,
                document_manager_guid,
                NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST
              );
            }}
            onRemoveFile={onRemoveFile}
            mineGuid={mineGuid}
            allowMultiple
            setUploading={setUploading}
            component={NoticeOfDepartureFileUpload}
            labelIdle='<strong class="filepond--label-action">Self-Assessment Upload</strong><div>Accepted filetypes: .doc .docx .xlsx .pdf</div>'
            maxFiles={1}
            acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
            uploadType={NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST}
          />
        </Form.Item>
        <Row>
          <Col span={16}>
            <p className="field-title">Uploaded File</p>
            <p>{checklist?.document_name || EMPTY_FIELD}</p>
          </Col>
          <Col span={5}>
            <p className="field-title">Upload Date</p>
            <p>{formatDate(checklist?.create_timestamp) || EMPTY_FIELD}</p>
          </Col>
          <Col span={3}>
            <p className="field-title">&nbsp;</p>
            <LinkButton
              className="nod-table-link"
              onClick={() => downloadFileFromDocumentManager(checklist)}
              title={checklist?.document_name}
            >
              Download
            </LinkButton>
          </Col>
        </Row>
        <h4 className="nod-modal-section-header">Upload Application Documents</h4>
        <Typography.Text className="">
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
            labelIdle='<strong class="filepond--label-action">Supporting Document Upload</strong><div>Accepted filetypes: .kmz .doc .docx .xlsx .pdf</div>'
            onRemoveFile={onRemoveFile}
            mineGuid={mineGuid}
            allowMultiple
            setUploading={setUploading}
            component={NoticeOfDepartureFileUpload}
            acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL, ...SPATIAL }}
            uploadType={NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.OTHER}
            validate={[required]}
          />
        </Form.Item>
        {otherDocuments.length > 0 && (
          <div>
            <Row>
              <Col span={16}>
                <p className="field-title">Uploaded File</p>
              </Col>
              <Col span={5}>
                <p className="field-title">Upload Date</p>
              </Col>
              <Col span={3}>
                <p className="field-title">&nbsp;</p>
              </Col>
            </Row>
            {otherDocuments.map((document) => (
              <Row>
                <Col span={16}>
                  <p>{document?.document_name || EMPTY_FIELD}</p>
                </Col>
                <Col span={5}>
                  <p>{formatDate(document?.create_timestamp) || EMPTY_FIELD}</p>
                </Col>
                <Col span={3}>
                  <LinkButton
                    className="nod-table-link"
                    onClick={() => downloadFileFromDocumentManager(document)}
                    title={document?.document_name}
                  >
                    Download
                  </LinkButton>
                </Col>
              </Row>
            ))}
          </div>
        )}
        <div className="ant-modal-footer">
          <Popconfirm
            placement="top"
            title="Are you sure you want to cancel?"
            okText="Yes"
            cancelText="No"
            onConfirm={closeModal}
          >
            <Button disabled={submitting}>Cancel</Button>
          </Popconfirm>
          <Button
            disabled={submitting || uploading || (pristine && documentArray.length === 0)}
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

EditNoticeOfDepartureForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  initialValues: getNoticeOfDeparture(state),
});

EditNoticeOfDepartureForm = reduxForm({
  form: FORM.EDIT_NOTICE_OF_DEPARTURE,
  onSubmitSuccess: resetForm(FORM.EDIT_NOTICE_OF_DEPARTURE),
  destroyOnUnmount: true,
  forceUnregisterOnUnmount: true,
  touchOnBlur: true,
  enableReinitialize: true,
})(EditNoticeOfDepartureForm);

EditNoticeOfDepartureForm = connect(mapStateToProps)(EditNoticeOfDepartureForm);

export default EditNoticeOfDepartureForm;

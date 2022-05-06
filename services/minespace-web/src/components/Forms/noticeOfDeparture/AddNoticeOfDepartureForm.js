import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { change, Field, reduxForm } from "redux-form";
import { Button, Col, Popconfirm, Row, Typography } from "antd";
import { Form } from "@ant-design/compatible";
import { maxLength, required, requiredList, validateSelectOptions } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import NoticeOfDepartureFileUpload from "@/components/Forms/noticeOfDeparture/NoticeOfDepartureFileUpload";
import { NOTICE_OF_DEPARTURE_DOCUMENT_TYPE } from "../../../../common/constants/strings";

const propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
};

const AddNoticeOfDepartureForm = (props) => {
  const { permits, onSubmit, closeModal, handleSubmit, mineGuid } = props;
  const [submitting, setSubmitting] = useState(false);
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
  };

  useEffect(() => {
    change("uploadedFiles", documentArray);
  }, [documentArray]);

  const onRemoveFile = (fileItem) => {
    setDocumentArray(
      documentArray.filter((document) => document.document_manager_guid !== fileItem.serverId)
    );
    setUploadedFiles(
      uploadedFiles.filter((file) => file.document_manager_guid !== fileItem.serverId)
    );
  };

  const hasChecklist = () => {
    return documentArray.some(
      (file) => file.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST
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
        <Typography.Title level={4}>Basic Information</Typography.Title>
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
          Upload Notice of Departure Self-Assessment Form
        </h4>
        <Typography.Text>
          Please upload your completed Self-assessment form (click here to download) below. Remember
          your completed form must be signed by the Mine Manager and any supporting information
          included or uploaded.
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
            allowMultiple
            component={NoticeOfDepartureFileUpload}
            maxFiles={1}
            acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
            uploadType={NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST}
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
            disabled={submitting || !hasChecklist()}
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

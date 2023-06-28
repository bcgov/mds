import React, { useState } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { Field, reduxForm, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm, Typography } from "antd";
import { resetForm } from "@common/utils/helpers";
import { required } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import IncidentFileUpload from "@/components/Forms/incidents/IncidentFileUpload";
import {
  INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD,
  FINAL_REPORT_DOCUMENTS_FORM_FIELD,
} from "@/components/Forms/incidents/IncidentForm";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(PropTypes.string).isRequired,
  incidentFormValues: CustomPropTypes.incident.isRequired,
  closeModal: PropTypes.func.isRequired,
  subTitle: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
  documentTypeCode: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
};

const UploadIncidentDocumentForm = (props) => {
  const { onSubmit, closeModal, handleSubmit } = props;
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

  const onRemoveFile = (_, fileItem, documentFormField) => {
    const updatedUploadedFiles = uploadedFiles.filter(
      (file) => file.document_manager_guid !== fileItem.serverId
    );
    setUploadedFiles(updatedUploadedFiles);

    return props.change(documentFormField, updatedUploadedFiles);
  };

  const handleUploadDocumentsSubmit = (values) => {
    let payload = { ...props.incidentFormValues };
    payload = {
      ...payload,
      ...values,
    };
    onSubmit(null, payload, false, true);
    closeModal();
  };

  const formFieldName =
    props.documentTypeCode === "FIN"
      ? FINAL_REPORT_DOCUMENTS_FORM_FIELD
      : INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD;

  return (
    <div>
      <Form layout="vertical" onSubmit={handleSubmit(handleUploadDocumentsSubmit)}>
        <Row>
          <Col span={24}>
            <Form.Item label={<b>{props.subTitle}</b>}>
              <Typography.Paragraph>{props.description}</Typography.Paragraph>
              <Field
                id={formFieldName}
                name={formFieldName}
                onFileLoad={(documentName, document_manager_guid) => {
                  onFileLoad(
                    documentName,
                    document_manager_guid,
                    props.documentTypeCode,
                    formFieldName
                  );
                }}
                onRemoveFile={onRemoveFile}
                mineGuid={props.mineGuid}
                component={IncidentFileUpload}
                labelIdle='<strong class="filepond--label-action">Drag & drop your files or Browse</strong><div>Accepted filetypes: .kmz .doc .docx .xlsx .pdf</div>'
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className="right center-mobile">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={closeModal}
            okText="Yes"
            cancelText="No"
          >
            <Button className="full-mobile margin-medium--right" type="secondary">
              Cancel
            </Button>
          </Popconfirm>
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            loading={props.submitting}
            disabled={props.formValues?.[formFieldName]?.length === 0}
          >
            Finish Upload
          </Button>
        </div>
      </Form>
    </div>
  );
};

UploadIncidentDocumentForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.UPLOAD_INCIDENT_DOCUMENT)(state) || {},
  incidentFormValues: getFormValues(FORM.ADD_EDIT_INCIDENT)(state) || {},
});

export default compose(
  connect(mapStateToProps),
  reduxForm({
    form: FORM.UPLOAD_INCIDENT_DOCUMENT,
    onSubmitSuccess: resetForm(FORM.UPLOAD_INCIDENT_DOCUMENT),
    initialValues: {
      [INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD]: [],
      [FINAL_REPORT_DOCUMENTS_FORM_FIELD]: [],
    },
    forceUnregisterOnUnmount: true,
    enableReinitialize: true,
  })
)(UploadIncidentDocumentForm);

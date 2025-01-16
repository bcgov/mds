import React, { useState } from "react";
import PropTypes from "prop-types";
import { Field, getFormValues, change } from "redux-form";
import { useDispatch, useSelector } from "react-redux";
import { Col, Row, Typography, Form } from "antd";
import { required } from "@mds/common/redux/utils/Validate";
import * as FORM from "@/constants/forms";
import IncidentFileUpload from "@/components/Forms/incidents/IncidentFileUpload";
import {
  INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD,
  FINAL_REPORT_DOCUMENTS_FORM_FIELD,
} from "@/components/Forms/incidents/IncidentForm";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  subTitle: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
  documentTypeCode: PropTypes.string.isRequired,
};

const UploadIncidentDocumentForm = (props) => {
  const { onSubmit, closeModal } = props;
  const dispatch = useDispatch();
  const formValues = useSelector(getFormValues(FORM.UPLOAD_INCIDENT_DOCUMENT)) || {};
  const incidentFormValues = useSelector(getFormValues(FORM.ADD_EDIT_INCIDENT)) || {};
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const formName = FORM.UPLOAD_INCIDENT_DOCUMENT;

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

    return dispatch(change(formName, documentFormField, updatedUploadedFiles));
  };

  const onRemoveFile = (_, fileItem, documentFormField) => {
    const updatedUploadedFiles = uploadedFiles.filter(
      (file) => file.document_manager_guid !== fileItem.serverId
    );
    setUploadedFiles(updatedUploadedFiles);

    return dispatch(change(formName, documentFormField, updatedUploadedFiles));
  };

  const handleUploadDocumentsSubmit = (values) => {
    let payload = { ...incidentFormValues };
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
      <FormWrapper
        onSubmit={handleUploadDocumentsSubmit}
        isModal
        scrollOnToggleEdit={false}
        name={FORM.UPLOAD_INCIDENT_DOCUMENT}
        initialValues={{
          [INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD]: [],
          [FINAL_REPORT_DOCUMENTS_FORM_FIELD]: [],
        }}
        reduxFormConfig={{
          forceUnregisterOnUnmount: true,
          enableReinitialize: true,
        }}
      >
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
                required
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className="right center-mobile">
          <RenderCancelButton />
          <RenderSubmitButton
            disabled={formValues?.[formFieldName]?.length === 0}
            buttonText="Finish Upload"
          />
        </div>
      </FormWrapper>
    </div>
  );
};

UploadIncidentDocumentForm.propTypes = propTypes;

export default UploadIncidentDocumentForm;

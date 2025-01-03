import React, { useState } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { Field, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { Button, Col, Row, Popconfirm, Typography, Form } from "antd";
import { resetForm } from "@common/utils/helpers";
import { required } from "@mds/common/redux/utils/Validate";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import IncidentFileUpload from "@/components/Forms/incidents/IncidentFileUpload";
import {
  INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD,
  FINAL_REPORT_DOCUMENTS_FORM_FIELD,
} from "@/components/Forms/incidents/IncidentForm";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
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
  const { onSubmit, closeModal } = props;
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
      <FormWrapper
        onSubmit={handleUploadDocumentsSubmit}
        name={FORM.UPLOAD_INCIDENT_DOCUMENT}
        initialValues={{
          [INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD]: [],
          [FINAL_REPORT_DOCUMENTS_FORM_FIELD]: [],
        }}
        reduxFormConfig={{
          onSubmitSuccess: resetForm(FORM.UPLOAD_INCIDENT_DOCUMENT),
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
      </FormWrapper>
    </div>
  );
};

UploadIncidentDocumentForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.UPLOAD_INCIDENT_DOCUMENT)(state) || {},
  incidentFormValues: getFormValues(FORM.ADD_EDIT_INCIDENT)(state) || {},
});

export default compose(connect(mapStateToProps))(UploadIncidentDocumentForm);

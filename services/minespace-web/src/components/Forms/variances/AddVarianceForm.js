import React, { useState } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Typography, Form } from "antd";
import { required, maxLength } from "@mds/common/redux/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import VarianceFileUpload from "@/components/Forms/variances/VarianceFileUpload";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  complianceCodes: CustomPropTypes.options.isRequired,
};

export const AddVarianceForm = (props) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onFileLoad = (documentName, document_manager_guid) => {
    const newUploadedFiles = [...uploadedFiles, { documentName, document_manager_guid }];
    setUploadedFiles(newUploadedFiles);
  };

  const onRemoveFile = (fileItem) => {
    const newUploadedFiles = uploadedFiles.filter(
      (doc) => doc.document_manager_guid !== fileItem.serverId
    );
    setUploadedFiles(newUploadedFiles);
  };

  return (
    <FormWrapper
      onSubmit={(values) => {
        const documentNameGuidMap = uploadedFiles.reduce(
          (acc, cur) => ({ ...acc, [cur.document_manager_guid]: cur.documentName }),
          {}
        );
        props.onSubmit({ ...values, files: documentNameGuidMap });
      }}
      isModal
      name={FORM.ADD_VARIANCE}
      reduxFormConfig={{
        touchOnBlur: false,
      }}
    >
      <Field
        id="compliance_article_id"
        name="compliance_article_id"
        label="Part of Code"
        required
        placeholder="Select a part of the code"
        component={renderConfig.SELECT}
        validate={[required]}
        data={props.complianceCodes}
      />
      <Field
        id="note"
        name="note"
        label="Description"
        component={renderConfig.AUTO_SIZE_FIELD}
        validate={[maxLength(300)]}
      />
      <Form.Item label="Attached Files">
        <Typography.Paragraph>Please upload all of the required documents.</Typography.Paragraph>
        <Field
          id="uploadedFiles"
          name="uploadedFiles"
          onFileLoad={onFileLoad}
          onRemoveFile={onRemoveFile}
          mineGuid={props.mineGuid}
          component={VarianceFileUpload}
        />
      </Form.Item>
      <div className="ant-modal-footer">
        <RenderCancelButton />
        <RenderSubmitButton buttonText="Submit" />
      </div>
    </FormWrapper>
  );
};

AddVarianceForm.propTypes = propTypes;

export default AddVarianceForm;

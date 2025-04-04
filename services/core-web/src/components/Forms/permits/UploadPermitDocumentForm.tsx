import React, { FC, useState } from "react";
import { change, Field } from "@mds/common/components/forms/form";
import { Col, Row } from "antd";
import * as FORM from "@/constants/forms";
import PermitAmendmentFileUpload from "@/components/mine/Permit/PermitAmendmentFileUpload";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import { useAppDispatch } from "@mds/common/redux/rootState";

interface UploadPermitDocumentProps {
  onSubmit: (values: any) => void;
  mineGuid: string;
  title: string;
}

export const UploadPermitDocumentFrom: FC<UploadPermitDocumentProps> = ({
  onSubmit,
  mineGuid,
  title,
}) => {
  const dispatch = useAppDispatch();

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const formName = FORM.UPLOAD_PERMIT_DOCUMENT;

  // File upload handlers
  const onFileLoad = (fileName: string, document_manager_guid: string) => {
    const newUploadedFiles = [{ fileName, document_manager_guid }, ...uploadedFiles];
    setUploadedFiles(newUploadedFiles);
    dispatch(change(formName, "uploadedFiles", newUploadedFiles));
  };

  const onRemoveFile = (err, fileItem) => {
    const newUploadedFiles = uploadedFiles.filter(
      (doc) => doc.document_manager_guid !== fileItem.serverId
    );
    setUploadedFiles(newUploadedFiles);
    dispatch(change(formName, "uploadedFiles", newUploadedFiles));
  };

  return (
    <FormWrapper
      onSubmit={onSubmit}
      name={FORM.UPLOAD_PERMIT_DOCUMENT}
      isModal
      reduxFormConfig={{
        touchOnBlur: false,
      }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Field
            id="uploadedFiles"
            name="uploadedFiles"
            onFileLoad={onFileLoad}
            onRemoveFile={onRemoveFile}
            mineGuid={mineGuid}
            component={PermitAmendmentFileUpload}
            allowMultiple={false}
          />
        </Col>
      </Row>
      <div className="right center-mobile">
        <RenderCancelButton />
        <RenderSubmitButton buttonText={title} disableOnClean={false} />
      </div>
    </FormWrapper>
  );
};

export default UploadPermitDocumentFrom;

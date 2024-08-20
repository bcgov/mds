import React, { FC, useState } from "react";
import { Field } from "redux-form";
import { useDispatch } from "react-redux";
import { Alert, Col, notification, Row, Typography } from "antd";
import { MineDocument } from "@mds/common/models/documents/document";
import { formatDate } from "@mds/common/redux/utils/helpers";
import RenderFileUpload from "@mds/common/components/forms/RenderFileUpload";
import { NEW_VERSION_DOCUMENTS } from "@mds/common/constants/API";
import { IMAGE, DOCUMENT, EXCEL, SPATIAL } from "@mds/common/constants/fileTypes";
import { postNewDocumentVersion } from "@mds/common/redux/actionCreators/documentActionCreator";
import { IMineDocumentVersion } from "@mds/common/interfaces";
import { FilePondFile } from "filepond";
import FormWrapper from "../forms/FormWrapper";
import { FORM } from "@mds/common/constants/forms";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import RenderCancelButton from "../forms/RenderCancelButton";
import RenderSubmitButton from "../forms/RenderSubmitButton";

interface ReplaceDocumentModalProps {
  document: MineDocument;
  alertMessage: string;
  handleSubmit(document: MineDocument): Promise<void>;
}

const ReplaceDocumentModal: FC<ReplaceDocumentModalProps> = (props) => {
  const dispatch = useDispatch();
  const { document, alertMessage } = props;
  const [versionGuid, setVersionGuid] = useState<string>();
  const [disableReplace, setDisableReplace] = useState<boolean>(true);
  const [updatedDocument, setUpdatedDocument] = useState<MineDocument>(document);

  const getAcceptedFileTypes = () => {
    const allAcceptedFileTypesMap = {
      ...DOCUMENT,
      ...EXCEL,
      ...IMAGE,
      ...SPATIAL,
    };
    const { file_type } = document;
    if (!file_type || !allAcceptedFileTypesMap[file_type]) {
      return allAcceptedFileTypesMap;
    }
    return { [file_type]: allAcceptedFileTypesMap[file_type] };
  };
  const acceptedFileTypesMap = getAcceptedFileTypes();

  const onFileLoad = async (fileName: string, document_manager_guid: string) => {
    setDisableReplace(false);
  };

  const onUploadResponse = (response) => {
    if (response.document_manager_version_guid) {
      setVersionGuid(response.document_manager_version_guid);
    }
  };

  const beforeUpload = (file: FilePondFile) => {
    return new Promise((resolve) => {
      setDisableReplace(true);
      if (`.${file.fileExtension}` !== document.file_type) {
        notification.error({
          message: "The selected file type does not match the original document",
          duration: 10,
        });
        return resolve(false);
      }
      setUpdatedDocument(
        new MineDocument({
          ...updatedDocument,
          document_name: file.filename,
          update_timestamp: formatDate(file.file.lastModified),
        })
      );

      return resolve(true);
    });
  };

  const onRemoveFile = (err, fileItem) => {
    setUpdatedDocument(document);
    setDisableReplace(true);
  };

  const handleReplaceSubmit = async () => {
    if (versionGuid) {
      const ConnectedVersion = await dispatch(
        postNewDocumentVersion({
          mineGuid: document.mine_guid,
          mineDocumentGuid: document.mine_document_guid,
          documentManagerVersionGuid: versionGuid,
        })
      );

      const newDocument = new MineDocument({
        ...updatedDocument,
        versions: [ConnectedVersion.data as IMineDocumentVersion, ...document.versions].reverse(),
      });

      props.handleSubmit(newDocument).then(() => dispatch(closeModal()));
    }
  };

  return (
    <FormWrapper name={FORM.REPLACE_DOCUMENT} onSubmit={handleReplaceSubmit} isModal>
      <Alert message="" showIcon type="warning" description={alertMessage} />
      <Typography.Paragraph strong className="margin-large--top">
        Original Document
      </Typography.Paragraph>
      <Row justify="space-between" className="padding-md--sides padding-sm--y">
        <Col span={10}>
          <Typography.Text>{document.document_name}</Typography.Text>
        </Col>
        <Col>
          <Typography.Text>{document.file_type}</Typography.Text>
        </Col>
        <Col>
          <Typography.Text>{formatDate(document.upload_date)}</Typography.Text>
        </Col>
        <Col>
          <Typography.Text>{document.update_user ?? document.create_user}</Typography.Text>
        </Col>
      </Row>

      <Field
        id="fileUpload"
        name="fileUpload"
        component={RenderFileUpload}
        uploadUrl={NEW_VERSION_DOCUMENTS({
          mineGuid: document.mine_guid,
          mineDocumentGuid: document.mine_document_guid,
        })}
        acceptedFileTypesMap={acceptedFileTypesMap}
        onFileLoad={onFileLoad}
        onRemoveFile={onRemoveFile}
        allowRevert
        allowMultiple={true}
        maxFiles={1}
        beforeAddFile={beforeUpload}
        beforeDropFile={beforeUpload}
        onUploadResponse={onUploadResponse}
      />

      <div className="ant-modal-footer">
        <RenderCancelButton />
        <RenderSubmitButton
          buttonText="Replace"
          disableOnClean={false}
          buttonProps={{ disabled: disableReplace }}
        />
      </div>
    </FormWrapper>
  );
};

export default ReplaceDocumentModal;

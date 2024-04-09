import React, { FC, useState } from "react";

import { Alert, Button, Col, Form, notification, Row, Typography } from "antd";
import { MineDocument } from "@mds/common/models/documents/document";
import { formatDate } from "@mds/common/redux/utils/helpers";
import RenderFileUpload from "@mds/common/components/forms/RenderFileUpload";
import { NEW_VERSION_DOCUMENTS } from "@mds/common/constants/API";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ActionCreator } from "@mds/common/interfaces/actionCreator";
import { IMAGE, DOCUMENT, EXCEL, SPATIAL } from "@mds/common/constants/fileTypes";
import { postNewDocumentVersion } from "@mds/common/redux/actionCreators/documentActionCreator";
import { IMineDocumentVersion } from "@mds/common";
import { FilePondFile } from "filepond";

interface ReplaceDocumentModalProps {
  document: MineDocument;
  postNewDocumentVersion: ActionCreator<typeof postNewDocumentVersion>;
  alertMessage: string;
  handleSubmit(document: MineDocument): Promise<void>;
  closeModal(): void;
}

const ReplaceDocumentModal: FC<ReplaceDocumentModalProps> = (props) => {
  const { document, alertMessage } = props;
  const [versionGuid, setVersionGuid] = useState<string>();
  const [disableReplace, setDisableReplace] = useState<boolean>(true);
  const [updatedDocument, setUpdatedDocument] = useState<MineDocument>(document);

  const acceptedFileTypesMap = {
    ...DOCUMENT,
    ...EXCEL,
    ...IMAGE,
    ...SPATIAL,
  };

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
      const ConnectedVersion = await props.postNewDocumentVersion({
        mineGuid: document.mine_guid,
        mineDocumentGuid: document.mine_document_guid,
        documentManagerVersionGuid: versionGuid,
      });

      const newDocument = new MineDocument({
        ...updatedDocument,
        versions: [ConnectedVersion.data as IMineDocumentVersion, ...document.versions].reverse(),
      });

      props.handleSubmit(newDocument).then(props.closeModal);
    }
  };

  return (
    <Form layout="vertical" onFinish={() => props.handleSubmit(document).then(props.closeModal)}>
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

      <RenderFileUpload
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
        <Button className="full-mobile" onClick={props.closeModal}>
          Cancel
        </Button>
        <Button
          className="full-mobile"
          type="primary"
          onClick={handleReplaceSubmit}
          disabled={disableReplace}
        >
          Replace
        </Button>
      </div>
    </Form>
  );
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      postNewDocumentVersion,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(ReplaceDocumentModal);

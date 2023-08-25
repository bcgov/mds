import React, { FC, useEffect, useState } from "react";

import { Alert, Button, Col, Form, Row, Typography } from "antd";
import { MineDocument } from "@common/models/documents/document";
import { formatDate } from "@common/utils/helpers";
import FileUpload from "@/components/common/FileUpload";
import { NEW_VERSION_PROJECT_SUMMARY_DOCUMENTS } from "@common/constants/API";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ActionCreator } from "@/interfaces/actionCreator";
import { HttpRequest, HttpResponse } from "tus-js-client";
import { IMAGE, DOCUMENT, EXCEL } from "@common/constants/fileTypes";
import { postNewDocumentVersion } from "@common/actionCreators/projectActionCreator";
import { IMineDocumentVersion } from "@mds/common";
import { FilePondFile } from "filepond";

interface ReplaceDocumentModalProps {
  document: MineDocument;
  postNewDocumentVersion: ActionCreator<typeof postNewDocumentVersion>;
  handleSubmit(document: MineDocument): Promise<void>;
  closeModal(): void;
}

const ReplaceDocumentModal: FC<ReplaceDocumentModalProps> = (props) => {
  const { document } = props;

  const [versionGuid, setVersionGuid] = useState<string>();
  const [disableReplace, setDisableReplace] = useState<boolean>(true);
  const [updatedDocument, setUpdatedDocument] = useState<MineDocument>(document);

  const acceptedFileTypesMap = {
    ...DOCUMENT,
    ...EXCEL,
    ...IMAGE,
  };

  const onFileLoad = async (fileName: string, document_manager_guid: string) => {
    setDisableReplace(false);
  };

  const onAfterResponse = (request: HttpRequest, response: HttpResponse) => {
    const responseBody = response.getBody();
    if (responseBody) {
      const jsonString = responseBody.replace(/'/g, '"');

      const obj = JSON.parse(jsonString);
      if (obj && obj.document_manager_version_guid) {
        setVersionGuid(obj.document_manager_version_guid);
      }
    }
  };

  const beforeUpload = (file: FilePondFile) => {
    return new Promise((resolve) => {
      setDisableReplace(true);
      if (`.${file.fileExtension}` !== document.file_type) {
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
    setDisableReplace(true);
    console.log(err, fileItem);
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

  useEffect(() => {
    if (document) {
      console.log("document", document);
      console.log(
        NEW_VERSION_PROJECT_SUMMARY_DOCUMENTS({
          mineGuid: document.mine_guid,
          mineDocumentGuid: document.mine_document_guid,
        })
      );
    }
  }, [document]);

  return (
    <Form layout="vertical" onFinish={() => props.handleSubmit(document).then(props.closeModal)}>
      <Alert
        message=""
        showIcon
        type="warning"
        description="The replaced file will not reviewed as part of the submission.  The new file should be in the same format as the original file."
      />
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

      <FileUpload
        id="fileUpload"
        name="fileUpload"
        component={FileUpload}
        uploadUrl={NEW_VERSION_PROJECT_SUMMARY_DOCUMENTS({
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
        onAfterResponse={onAfterResponse}
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

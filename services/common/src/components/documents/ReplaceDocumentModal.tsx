import React, { FC, useEffect, useRef, useState } from "react";
import { Field } from "@mds/common/components/forms/form";
import { Alert, Col, notification, Row, Typography } from "antd";
import { MineDocument } from "@mds/common/models/documents/document";
import { formatDate } from "@mds/common/redux/utils/helpers";
import RenderFileUpload from "@mds/common/components/forms/RenderFileUpload";
import { DOCUMENT_MANAGER_DOCUMENT_VERSION, NEW_VERSION_DOCUMENTS } from "@mds/common/constants/API";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import CustomAxios from "@mds/common/redux/customAxios";
import { createRequestHeader } from "@mds/common/redux/utils/RequestHeaders";
import { IMAGE, DOCUMENT, EXCEL, SPATIAL } from "@mds/common/constants/fileTypes";
import { postNewDocumentVersion } from "@mds/common/redux/actionCreators/documentActionCreator";
import { IMineDocumentVersion } from "@mds/common/interfaces";
import { FilePondFile } from "filepond";
import { AxiosResponse } from "axios";
import FormWrapper from "../forms/FormWrapper";
import { FORM } from "@mds/common/constants/forms";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import RenderCancelButton from "../forms/RenderCancelButton";
import RenderSubmitButton from "../forms/RenderSubmitButton";
import { useAppDispatch } from "@mds/common/redux/rootState";

interface ReplaceDocumentModalProps {
  document: MineDocument;
  alertMessage: string;
  handleSubmit(document: MineDocument): Promise<void>;
  // Override where the replacement file is uploaded and how the new version is recorded. Default to the mine document endpoints.
  uploadUrl?: string;
  createVersion?(documentManagerVersionGuid: string): Promise<AxiosResponse<IMineDocumentVersion> | void>;
}

const ReplaceDocumentModal: FC<ReplaceDocumentModalProps> = (props) => {
  const dispatch = useAppDispatch();
  const { document, alertMessage } = props;
  const [versionGuid, setVersionGuid] = useState<string>();
  const [disableReplace, setDisableReplace] = useState<boolean>(true);
  const [updatedDocument, setUpdatedDocument] = useState<MineDocument>(document);

  // The uploaded replacement file is held in a temporary location until "Replace" is clicked.
  // If the user backs out, it is discarded.
  const versionGuidRef = useRef<string>();
  const committedRef = useRef(false);

  const discardVersion = () => {
    const guid = versionGuidRef.current;
    if (!guid || committedRef.current) {
      return;
    }
    versionGuidRef.current = undefined;
    CustomAxios({ suppressErrorNotification: true })
      .delete(
        ENVIRONMENT.docManUrl + DOCUMENT_MANAGER_DOCUMENT_VERSION(document.document_manager_guid, guid),
        createRequestHeader()
      )
      .catch(() => { });
  };

  useEffect(() => {
    return () => discardVersion();
  }, []);

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
      versionGuidRef.current = response.document_manager_version_guid;
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
      const docConstructor = document instanceof MineDocument ? (document as any).constructor : MineDocument;
      setUpdatedDocument(
        new docConstructor({
          ...updatedDocument,
          document_name: file.filename,
          update_timestamp: new Date().toISOString(),
        })
      );

      return resolve(true);
    });
  };

  const onRemoveFile = (err, fileItem) => {
    discardVersion();
    setVersionGuid(undefined);
    setUpdatedDocument(document);
    setDisableReplace(true);
  };

  const createVersion =
    props.createVersion ??
    ((documentManagerVersionGuid: string) =>
      dispatch(
        postNewDocumentVersion({
          mineGuid: document.mine_guid,
          mineDocumentGuid: document.mine_document_guid,
          documentManagerVersionGuid,
        })
      ));

  const handleReplaceSubmit = async () => {
    if (versionGuid) {
      let ConnectedVersion;
      try {
        ConnectedVersion = await createVersion(versionGuid);
      } catch (error) {
        // The action creator has already surfaced the error; keep the modal open so the user can retry.
        return;
      }

      if (ConnectedVersion) {
        committedRef.current = true;
        const docConstructor = document instanceof MineDocument ? (document as any).constructor : MineDocument;
        const existingVersionsAsc = (document.versions ?? []).slice().reverse();
        const newVersionsChronological = [...existingVersionsAsc, ConnectedVersion.data as IMineDocumentVersion];
        const newDocument = new docConstructor({
          ...updatedDocument,
          versions: newVersionsChronological,
        });

        try {
          await props.handleSubmit(newDocument);
          dispatch(closeModal());
        } catch (error) {
          // handleSubmit is responsible for surfacing the error and rolling back any optimistic updates; keep the modal open so the user can retry.
        }
      }
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
          <Typography.Text>{document.create_user}</Typography.Text>
        </Col>
      </Row>

      <Field
        id="fileUpload"
        name="fileUpload"
        component={RenderFileUpload}
        uploadUrl={
          props.uploadUrl ??
          NEW_VERSION_DOCUMENTS({
            mineGuid: document.mine_guid,
            mineDocumentGuid: document.mine_document_guid,
          })
        }
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

import React, { FC, useEffect, useState, ReactNode } from "react";
import { Field, WrappedFieldProps } from "redux-form";
import { useSelector } from "react-redux";
import { NEW_VERSION_DOCUMENTS, PROJECT_SUMMARY_DOCUMENTS } from "@mds/common/constants/API";
import RenderFileUpload from "@mds/common/components/forms/RenderFileUpload";
import { Alert, Divider, Modal, Popconfirm, Table, Typography } from "antd";
import { getUserInfo } from "@mds/common/redux/selectors/authenticationSelectors";
import { FilePondFile } from "filepond";
import { IDocument } from "@mds/common";

const notificationDisabledStatusCodes = [409]; // Define the notification disabled status codes

interface ProjectSummaryFileUploadProps {
  onFileLoad: (fileName: string, document_guid: string, version_guid) => void;
  onRemoveFile: () => void;
  acceptedFileTypesMap: object;
  params: any;
  documents: IDocument[];
  label?: string | ReactNode;
  labelIdle?: string;
}

export const ProjectSummaryFileUpload: FC<WrappedFieldProps & ProjectSummaryFileUploadProps> = (
  props
) => {
  const [archivedFileModalMessage, setArchivedFileModalMessage] = useState("");
  const [isArchivedFileModalVisible, setIsArchivedFileModalVisible] = useState(false);
  const [replaceableFileModalMessage, setReplaceableFileModalMessage] = useState("");
  const [isReplaceableFileModalVisible, setReplaceableFileModalVisible] = useState(false);
  const [fileName, setFileName] = useState("");
  const [shouldReplaceFile, setShouldReplaceFile] = useState(false);
  const [replaceFileUploadUrl, setReplaceFileUploadUrl] = useState<undefined | string>();
  const [mineDocumentGuid, setMineDocumentGuid] = useState(null);
  const [mineGuid, setMineGuid] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [shouldAbortUpload, setShouldAbortUpload] = useState(false);
  const [handleModalClose, setHandleModalClose] = useState<(() => void) | null>(null);
  const [handleModalSubmit, setHandleModalSubmit] = useState<(() => void) | null>(null);
  const [existingFiles, setExistingFiles] = useState([]);
  const [version, setVersion] = useState();
  const [uploadUrl, setUploadUrl] = useState(PROJECT_SUMMARY_DOCUMENTS(props.params));

  const userInfo = useSelector(getUserInfo);

  const handleCloseModal = () => {
    if (handleModalClose) {
      handleModalClose();
    }
  };

  const handleNewVersionSubmit = () => {
    if (handleModalSubmit) {
      handleModalSubmit();
    }
  };

  const columns = [
    { dataIndex: "fileName" },
    { dataIndex: "fileType" },
    { dataIndex: "date" },
    { dataIndex: "uploader" },
  ];

  function getFileExtension(fileName) {
    return fileName ? "." + fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase() : null;
  }

  useEffect(() => {
    if (existingFiles.length === 0) {
      setExistingFiles(props.documents);
    }
  }, [props.documents]);

  const beforeUpload = (file: FilePondFile) => {
    setShouldReplaceFile(false);
    setShouldAbortUpload(false);
    setFileName("");
    setMineDocumentGuid(null);
    setVersion(null);
    return new Promise<boolean>((resolve, reject) => {
      const existingDocument = existingFiles.find(
        (document) => document.document_name === file.filename
      );

      if (existingDocument) {
        const message = `A file with the same name already exists in this project. Replacing it will create a new version of the original file and replace it as part of this submission.`;
        setReplaceableFileModalMessage(message);
        setReplaceableFileModalVisible(true);
        setMineGuid(existingDocument.mine_guid);
        setMineDocumentGuid(existingDocument.mine_document_guid);

        const date = new Date();
        const options: Intl.DateTimeFormatOptions = {
          year: "numeric",
          month: "short",
          day: "2-digit",
        };
        const formattedDate = date.toLocaleDateString("en-US", options);

        setHandleModalClose(() => {
          return () => {
            setIsArchivedFileModalVisible(false);
            setReplaceableFileModalVisible(false);
            setShouldAbortUpload(true);
            // Resolve the promise with false (cancel upload)
            resolve(false);
          };
        });

        setHandleModalSubmit(() => {
          return () => {
            setReplaceableFileModalVisible(false);
            setUploadUrl(
              NEW_VERSION_DOCUMENTS({
                mineGuid: props.params.mineGuid,
                mineDocumentGuid: existingDocument.mine_document_guid,
              })
            );
            // Resolve the promise with true (proceed with upload)
            resolve(true);
          };
        });

        setFileDetails({
          file_name: file.filename,
          file_type: getFileExtension(file.filename),
          update_timestamp: `${formattedDate}`,
          update_user: userInfo.preferred_username,
        });

        // If the file exists, we're displaying a dialogue and will resolve
        // the Promise once user has made a choice.
        return;
      } else {
        setReplaceFileUploadUrl(undefined);
        setShouldReplaceFile(false);
        setHandleModalClose(null);
        setHandleModalSubmit(null);

        // If there's no existing document, resolve the Promise with true
        // to proceed with the upload.
        resolve(true);
      }
    });
  };

  const onUploadResponse = (response) => {
    if (response.document_manager_version_guid) {
      setVersion(response.document_manager_version_guid);
    }
  };

  const handleFileLoad = (fileName: string, document_guid: string, versionGuid: string) => {
    props.onFileLoad(fileName, document_guid, {
      document_manager_version_guid: version || versionGuid,
      document_manager_guid: mineDocumentGuid,
    });
  };

  const onError = (filename: string, e) => {
    setFileName(fileName);
    if (
      e.response.status_code &&
      notificationDisabledStatusCodes.includes(e.response.status_code)
    ) {
      if (e.response.status === "ARCHIVED_FILE_EXIST") {
        setShouldAbortUpload(false);
        const message = `An archived file named ${filename} already exists. If you would like to restore it, download the archived file and upload it again with a different file name.`;
        setArchivedFileModalMessage(message);
        setIsArchivedFileModalVisible(true);
      }
      if (e.response.status === "REPLACEABLE_FILE_EXIST") {
        setShouldAbortUpload(false);
        const message = `A file with the same name already exists in this project. Replacing it will create a new version of the original file and replace it as part of this submission.`;
        setReplaceableFileModalMessage(message);
        setReplaceableFileModalVisible(true);
        setMineGuid(e.response.mine_guid);
        setMineDocumentGuid(e.response.mine_document_guid);

        const date = new Date(e.response.update_timestamp);
        const options: Intl.DateTimeFormatOptions = {
          year: "numeric",
          month: "short",
          day: "2-digit",
        };
        const formattedDate = date.toLocaleDateString("en-US", options);

        setFileDetails({
          file_name: filename,
          file_type: e.response.file_type,
          update_timestamp: `${formattedDate}`,
          update_user: e.response.update_user,
        });
      }
    }
  };

  return (
    <>
      <Field
        {...(props.label ? { label: props.label } : {})}
        {...(props.labelIdle ? { labelIdle: props.labelIdle } : {})}
        newAbbrevLabel={true}
        id="fileUpload"
        name="fileUpload"
        component={RenderFileUpload}
        shouldReplaceFile={shouldReplaceFile}
        uploadUrl={uploadUrl}
        replaceFileUploadUrl={replaceFileUploadUrl}
        acceptedFileTypesMap={props.acceptedFileTypesMap}
        onFileLoad={handleFileLoad}
        onRemoveFile={props.onRemoveFile}
        notificationDisabledStatusCodes={notificationDisabledStatusCodes}
        shouldAbortUpload={shouldAbortUpload}
        allowRevert
        allowMultiple
        props={{
          beforeAddFile: beforeUpload,
          beforeDropFile: beforeUpload,
          onError,
          onUploadResponse,
        }}
      />
      <Popconfirm
        open={isArchivedFileModalVisible}
        placement="right"
        title={
          <div>
            <h4>File name already exists</h4>{" "}
            <p>
              <br />
              {archivedFileModalMessage}
            </p>
          </div>
        }
        onConfirm={handleCloseModal}
        onCancel={handleCloseModal}
        okText="Close"
        cancelText=""
      ></Popconfirm>

      <Modal
        title=""
        open={isReplaceableFileModalVisible}
        onOk={handleNewVersionSubmit}
        onCancel={handleCloseModal}
        okText="Yes, replace"
        cancelText="Cancel"
        width={1000}
        className="new-file-replace-modal"
      >
        <Typography.Paragraph strong style={{ padding: "0px 0px 0px 24px" }}>
          Replace File?
        </Typography.Paragraph>
        <Divider style={{ height: "3px", background: "#F0F0F0" }} />
        <div style={{ padding: "0px 24px 0px 24px" }}>
          <Typography.Paragraph>
            <Alert
              message="File Already exists"
              showIcon
              type="warning"
              description={replaceableFileModalMessage}
            />
          </Typography.Paragraph>
          <Typography.Text title="Original Doc">
            <b>Original Document</b>
          </Typography.Text>
          <Table
            dataSource={[
              {
                fileName: fileDetails?.file_name ?? "-",
                fileType: getFileExtension(fileDetails?.file_name) ?? "-",
                date: fileDetails?.update_timestamp ?? "-",
                uploader: fileDetails?.update_user ?? "-",
              },
            ]}
            columns={columns}
            showHeader={false} // Hide table header
            pagination={false} // Disable pagination
            className="new-file-replace-table"
          />
          <Typography.Text title="Upload new">
            <b>Upload new file</b>
          </Typography.Text>
          <Table
            dataSource={[
              {
                fileName: fileDetails?.file_name ?? "-",
                fileType: getFileExtension(fileDetails?.file_name) ?? "-",
                date: new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                }),
                uploader: userInfo.preferred_username,
              },
            ]}
            columns={columns}
            showHeader={false} // Hide table header
            pagination={false} // Disable pagination
            className="new-file-replace-table"
          />
        </div>
      </Modal>
    </>
  );
};

export default ProjectSummaryFileUpload;

import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { useSelector } from "react-redux";
import {
  PROJECT_SUMMARY_DOCUMENTS,
  NEW_VERSION_PROJECT_SUMMARY_DOCUMENTS,
} from "@common/constants/API";
import FileUpload from "@/components/common/FileUpload";
import { Alert, Typography, Modal, Table, Divider, Popconfirm } from "antd";
import { getUserInfo } from "@/selectors/authenticationSelectors";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  acceptedFileTypesMap: PropTypes.objectOf(PropTypes.string).isRequired,
  params: PropTypes.objectOf(PropTypes.string).isRequired,
};

const notificationDisabledStatusCodes = [409]; // Define the notification disabled status codes

export const ProjectSummaryFileUpload = (props) => {
  const [archivedFileModalMessage, setArchivedFileModalMessage] = useState("");
  const [isArchivedFileModalVisible, setIsArchivedFileModalVisible] = useState(false);
  const [relaplaceableFileModalMessage, setRelaplaceableFileModalMessage] = useState("");
  const [isRelaplaceableFileModalVisible, setRelaplaceableFileModalVisible] = useState(false);
  const [fileName, setFileName] = useState("");
  const [shouldReplaceFile, setShouldReplaceFile] = useState(false);
  const [replaceFileUploadUrl, setReplaceFileUploadUrl] = useState(false);
  const [mineDocumentGuid, setMineDocumentGuid] = useState(null);
  const [mineGuid, setMineGuid] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [shouldAbortUpload, setShouldAbortUpload] = useState(false);

  const userInfo = useSelector(getUserInfo);

  const handleCloseModal = () => {
    setIsArchivedFileModalVisible(false);
    setRelaplaceableFileModalVisible(false);
    setShouldAbortUpload(true);
  };

  const childRef = useRef(null);

  const handleNewVersionSubmit = () => {
    setRelaplaceableFileModalVisible(false);
    setReplaceFileUploadUrl(
      NEW_VERSION_PROJECT_SUMMARY_DOCUMENTS({
        mineGuid: props.params.mineGuid,
        mineDocumentGuid: mineDocumentGuid,
      })
    );
    setShouldReplaceFile(true);
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

  return (
    <>
      <Field
        ref={childRef}
        id="fileUpload"
        name="fileUpload"
        component={FileUpload}
        shouldReplaceFile={shouldReplaceFile}
        uploadUrl={PROJECT_SUMMARY_DOCUMENTS(props.params)}
        replaceFileUploadUrl={replaceFileUploadUrl}
        acceptedFileTypesMap={props.acceptedFileTypesMap}
        onFileLoad={props.onFileLoad}
        onRemoveFile={props.onRemoveFile}
        notificationDisabledStatusCodes={notificationDisabledStatusCodes}
        shouldAbortUpload={shouldAbortUpload}
        allowRevert
        allowMultiple
        onError={(filename, e) => {
          setFileName(fileName);
          if (
            e.response.status_code &&
            notificationDisabledStatusCodes.includes(e.response.status_code)
          ) {
            if (e.response.status === "ARCHIVED_FILE_EXIST") {
              setShouldAbortUpload(false);
              let message = `An archived file named ${filename} already exists. If you would like to restore it, download the archived file and upload it again with a different file name.`;
              setArchivedFileModalMessage(message);
              setIsArchivedFileModalVisible(true);
            }
            if (e.response.status === "REPLACEABLE_FILE_EXIST") {
              setShouldAbortUpload(false);
              let message = `A file with the same name already exists in this project. Replacing it will create a new version of the original file and replace it as part of this submission.`;
              setRelaplaceableFileModalMessage(message);
              setRelaplaceableFileModalVisible(true);
              setMineGuid(e.response.mine_guid);
              setMineDocumentGuid(e.response.mine_document_guid);

              const date = new Date(e.response.update_timestamp);
              const options = { year: "numeric", month: "short", day: "2-digit" };
              const formattedDate = date.toLocaleDateString("en-US", options);

              setFileDetails({
                file_name: filename,
                file_type: e.response.file_type,
                update_timestamp: `${formattedDate}`,
                update_user: e.response.update_user,
              });
            }
          }
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
        open={isRelaplaceableFileModalVisible}
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
              description={relaplaceableFileModalMessage}
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

ProjectSummaryFileUpload.propTypes = propTypes;

export default ProjectSummaryFileUpload;

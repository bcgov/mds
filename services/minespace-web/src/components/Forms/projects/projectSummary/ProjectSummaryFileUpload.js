import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import {
  PROJECT_SUMMARY_DOCUMENTS,
  NEW_VERSION_PROJECT_SUMMARY_DOCUMENTS,
} from "@common/constants/API";
import FileUpload from "@/components/common/FileUpload";
import { Alert, Form, Typography, Modal, Table, Divider, Popconfirm } from "antd";

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
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadKey, setUploadKey] = useState(0);

  const handleCloseModal = () => {
    console.log("Closing....");
    setIsArchivedFileModalVisible(false);
    setRelaplaceableFileModalVisible(false);
  };

  const childRef = useRef(null);

  const handleManualUpload = () => {
    // Call the upload.start() function using the ref
    const uploadInstance = childRef.current?.props?.onFileLoad();
    // Do whatever you need with the 'uploadInstance', you can start the upload by calling 'uploadInstance.start()'
  };

  const handleNewVersionSubmit = () => {
    console.log("TODO: handleNewVersionSubmit()");
    setRelaplaceableFileModalVisible(false);
    console.log("TODO: callFileUpload()");
    // setIsFileUploading(true)
    setUploadUrl(NEW_VERSION_PROJECT_SUMMARY_DOCUMENTS('mine_guid', 'mine_document_guid'));
    // setUploadRetryCount(uploadRetryCount + 1);
    handleManualUpload();

    // childRef.current.startFileUpload();

    //
    // props.onFileLoad(fileName, document_manager_guid)
    // props.onFileLoad(fileName, "document_manager_guid")

    console.log("-->>>>props.onFileReplace");
  };

  const dataOriginal = [
    {
      fileName: "file1.pdf",
      fileType: "spatial",
      date: "Nov 23 2022",
      uploader: "idr/ignw",
    },
  ];

  const dataNew = [
    {
      fileName: "file1.pdf",
      fileType: "spatial",
      date: "Nov 23 2022",
      uploader: "idr/ignw",
    },
  ];

  const columns = [
    { dataIndex: "fileName", width: "40%" },
    { dataIndex: "fileType", width: "20%" },
    { dataIndex: "date", width: "20%" },
    { dataIndex: "uploader", width: "20%" },
  ];

  return (
    <>
      <Field
        ref={childRef}
        id="fileUpload"
        name="fileUpload"
        component={FileUpload}
        addFileStart={() => setUploading(isFileUploading)}
        uploadUrl={PROJECT_SUMMARY_DOCUMENTS(props.params)}
        acceptedFileTypesMap={props.acceptedFileTypesMap}
        onFileLoad={props.onFileLoad}
        onRemoveFile={props.onRemoveFile}
        notificationDisabledStatusCodes={notificationDisabledStatusCodes}
        allowRevert
        allowMultiple
        key={uploadKey}
        onError={(filename, e) => {
          setFileName(fileName);
          if (
            e.response.status_code &&
            notificationDisabledStatusCodes.includes(e.response.status_code)
          ) {
            console.log("Error STATUS: ", e.response.status);
            if (e.response.status === "ARCHIVED_FILE_EXIST") {
              let message = `An archived file named ${filename} already exists. If you would like to restore it, download the archived file and upload it again with a different file name.`;
              setArchivedFileModalMessage(message);
              setIsArchivedFileModalVisible(true);
            }
            if (e.response.status === "REPLACEABLE_FILE_EXIST") {
              //replace belows
              let message = `A file with the same name already exists in this project. Replacing it will create a new version of the original file and replace it as part of this submission.`;
              setRelaplaceableFileModalMessage(message);
              setRelaplaceableFileModalVisible(true);
              console.log("_______________RESP", e.response);
              console.log("_______________ORGREQ", e.originalRequest);
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
        // orientationMargin="0"
        // bodyStyle={{ padding: '24px 0px 24px 0px'}}
        className="custom-modal"
      >
        <style>
          {`
            .custom-modal .ant-modal-body {
              padding-bottom: 24px;
              padding-left: 0px;
              padding-right: 0px;
              padding-top: 24px;
              color: red;
            }
            .ant-modal-footer {
              padding: 24px;
            }
          `}
        </style>
        <Typography.Paragraph strong style={{ padding: "0px 0px 0px 24px" }}>
          Replace File?
        </Typography.Paragraph>
        <Divider style={{ height: "3px", background: "#F0F0F0" }} />
        <div style={{ padding: "0px 24px 0px 24px" }}>
          {/* // onFinish={() => props.handleSubmit(props.documents).then(props.closeModal)} */}

          <Typography.Paragraph>
            <Alert
              message="File Already exists"
              showIcon
              type="warning"
              description={relaplaceableFileModalMessage}
            />
          </Typography.Paragraph>

          <>
            <style>
              {`
                .custom-table .ant-table-tbody > tr.ant-table-row > td {
                  border-bottom: none;
                }
              `}
            </style>
            <Typography.Text title="Original Doc">
              <b>Original Document</b>
            </Typography.Text>
            <Table
              dataSource={dataOriginal}
              columns={columns}
              showHeader={false} // Hide table header
              pagination={false} // Disable pagination
              className="custom-table" // Apply custom CSS class
            />
            <Typography.Text title="Upload new">
              <b>Upload new file</b>
            </Typography.Text>
            <Table
              dataSource={dataNew}
              columns={columns}
              showHeader={false} // Hide table header
              pagination={false} // Disable pagination
              className="custom-table" // Apply custom CSS class
            />
          </>
        </div>
      </Modal>
    </>
  );
};

ProjectSummaryFileUpload.propTypes = propTypes;

export default ProjectSummaryFileUpload;

// import React, { useRef } from 'react';
// import ChildComponent from './ChildComponent';

// const ParentComponent = () => {
//   const childRef = useRef();

//   const handleClick = () => {
//     childRef.current.myFunction();
//   };

//   return (
//     <div>
//       <h1>Parent Component</h1>
//       <ChildComponent ref={childRef} />
//       <button onClick={handleClick}>Call Child Function</button>
//     </div>
//   );
// };

// export default ParentComponent;

// const handleNewVersionSubmit = () => {
//   console.log('TODO: handleNewVersionSubmit()')
//   setRelaplaceableFileModalVisible(false);
//   console.log('TODO: callFileUpload()')

//   if (childRef.current) {
//     console.log('CALLLLING child function________________________')
//     childRef.current.childFunction(); // Step 2: Call the child function using the ref
//   }

//   childRef.current.childFunction();

//   const fileUpload = new FileUpload(props);
//   // fileUpload.setFileUploading(true);
//   fileUpload.addFileStart = true

//   // fileUpload.uploadUrl = 'http://localhost:3000/upload';
//   // fileUpload.onFileLoad = onFileLoad
//   // // fileUpload.server.process.up

//   // return (
//   //   <Field
//   //       id="fileUpload"
//   //       name="fileUpload"
//   //       component={FileUpload}
//   //       uploadUrl={PROJECT_SUMMARY_DOCUMENTS(props.params)}
//   //       acceptedFileTypesMap={props.acceptedFileTypesMap}
//   //       onFileLoad={props.onFileLoad}
//   //       onRemoveFile={props.onRemoveFile}
//   //       // notificationDisabledStatusCodes={notificationDisabledStatusCodes}
//   //       allowRevert
//   //       allowMultiple
//   //       onError={(filename, e) => {
//   //         console.log('Error in uploading ', filename, ' as new version ', e)
//   //       }
//   //     }
//   //   />
//   // )
// }

import { uniq, concat, reject } from "lodash";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Field } from "redux-form";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { DOCUMENT, EXCEL, IMAGE, SPATIAL } from "@common/constants/fileTypes";
import FileUpload from "@/components/common/FileUpload";
import LinkButton from "@/components/common/LinkButton";
import { MINE_REPORT_DOCUMENT } from "@/constants/API";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  updateMineReportSubmissions: PropTypes.func.isRequired,
  mineReportSubmissions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  showUploadedFiles: PropTypes.bool,
};

const defaultProps = {
  mineReportSubmissions: [],
  showUploadedFiles: false,
};

export const ReportSubmissions = (props) => {
  const uploadedFiles =
    props.mineReportSubmissions &&
    props.mineReportSubmissions.length > 0 &&
    props.mineReportSubmissions[props.mineReportSubmissions.length - 1].documents &&
    props.mineReportSubmissions[props.mineReportSubmissions.length - 1].documents.length > 0
      ? props.mineReportSubmissions[props.mineReportSubmissions.length - 1].documents.filter(
          (file) => file.mine_document_guid
        )
      : [];

  const [initialUploadedFiles] = useState(uploadedFiles);

  const handleRemoveFile = (error, fileToRemove) => {
    let updatedSubmissions = props.mineReportSubmissions;
    updatedSubmissions[updatedSubmissions.length - 1].documents = reject(
      updatedSubmissions[updatedSubmissions.length - 1].documents,
      (file) => fileToRemove.serverId === file.document_manager_guid
    );
    if (updatedSubmissions.length === 1 && updatedSubmissions[0].documents.length === 0) {
      updatedSubmissions = [];
    }
    props.updateMineReportSubmissions(updatedSubmissions);
  };

  const handleFileLoad = (documentName, documentManagerGuid) => {
    const updatedSubmissions =
      props.mineReportSubmissions && props.mineReportSubmissions.length > 0
        ? props.mineReportSubmissions
        : [{ documents: [] }];
    updatedSubmissions[updatedSubmissions.length - 1].documents = concat(
      updatedSubmissions[updatedSubmissions.length - 1].documents,
      {
        document_name: documentName,
        document_manager_guid: documentManagerGuid,
      }
    );
    props.updateMineReportSubmissions(updatedSubmissions);
  };

  const acceptedFileTypesMap = { ...DOCUMENT, ...EXCEL, ...IMAGE, ...SPATIAL };

  return (
    <div>
      {props.showUploadedFiles && (
        <Form.Item label="Uploaded Files">
          {(initialUploadedFiles && initialUploadedFiles.length > 0 && (
            <ul style={{ paddingLeft: 20 }}>
              {initialUploadedFiles.map((file) => (
                <li key={file.mine_document_guid}>
                  <LinkButton
                    onClick={() => downloadFileFromDocumentManager(file)}
                    title={file.document_name}
                  >
                    {file.document_name}
                  </LinkButton>
                </li>
              ))}
            </ul>
          )) || <div>This report has no uploaded files.</div>}{" "}
        </Form.Item>
      )}
      <Form.Item label="Upload Files">
        <ul style={{ paddingLeft: 20 }}>
          <li>You can attach multiple files for the report in the box below</li>
          <li>You cannot upload ZIP files</li>
          <li>The allowed file types are: {uniq(Object.keys(acceptedFileTypesMap)).join(", ")}</li>
          <li>Maximum individual file size is 400 MB</li>
        </ul>
        <Field
          id="ReportFileUpload"
          name="ReportFileUpload"
          component={FileUpload}
          allowRevert
          allowMultiple
          acceptedFileTypesMap={acceptedFileTypesMap}
          uploadUrl={MINE_REPORT_DOCUMENT(props.mineGuid)}
          onFileLoad={handleFileLoad}
          onRemoveFile={handleRemoveFile}
        />
      </Form.Item>
    </div>
  );
};

ReportSubmissions.propTypes = propTypes;
ReportSubmissions.defaultProps = defaultProps;

export default ReportSubmissions;

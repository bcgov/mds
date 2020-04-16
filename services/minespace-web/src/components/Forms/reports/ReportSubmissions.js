import React, { useState } from "react";
import PropTypes from "prop-types";
import { Form } from "antd";
import { Field } from "redux-form";
import { concat, reject } from "lodash";
import FileUpload from "@/components/common/FileUpload";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import LinkButton from "@/components/common/LinkButton";
import { MINE_REPORT_DOCUMENT } from "@/constants/API";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";

import { ReportsUploadedFilesList } from "@/components/Forms/reports/ReportsUploadedFilesList";

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

  const [initialUploadedFiles, setInitialUploadedFiles] = useState(uploadedFiles);

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

  const acceptedFileTypesMap = { ...DOCUMENT, ...EXCEL };

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
          <li>The allowed file types are: {Object.values(acceptedFileTypesMap).join(", ")}</li>
          <li>Maximum individual file size is 400 MB</li>
        </ul>
        <Field
          id="ReportFileUpload"
          name="ReportFileUpload"
          component={FileUpload}
          allowRevert
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

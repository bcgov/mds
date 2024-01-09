import { concat, reject } from "lodash";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { downloadFileFromDocumentManager } from "@mds/common/redux/utils/actionlessNetworkCalls";
import { DOCUMENT, EXCEL, IMAGE, SPATIAL } from "@mds/common/constants/fileTypes";
import LinkButton from "@mds/common/components/common/LinkButton";
import { MINE_REPORT_DOCUMENT } from "@mds/common/constants/API";
import RenderFileUpload from "../forms/RenderFileUpload";
import { Form } from "antd";
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
        // what is this? Why is it a FormItem?
        // this prop (showUploadedFiles) isn't used anywhere within common, suggest removing when we get to file management
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
      <Field
        id="ReportFileUpload"
        name="ReportFileUpload"
        label="Upload Files"
        component={RenderFileUpload}
        allowRevert
        allowMultiple
        acceptedFileTypesMap={acceptedFileTypesMap}
        uploadUrl={MINE_REPORT_DOCUMENT(props.mineGuid)}
        onFileLoad={handleFileLoad}
        onRemoveFile={handleRemoveFile}
      />
    </div>
  );
};

ReportSubmissions.propTypes = propTypes;
ReportSubmissions.defaultProps = defaultProps;

export default ReportSubmissions;

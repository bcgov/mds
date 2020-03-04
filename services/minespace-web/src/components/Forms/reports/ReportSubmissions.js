import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { concat, reject } from "lodash";
import FileUpload from "@/components/common/FileUpload";
import { MINE_REPORT_DOCUMENT } from "@/constants/API";
import { ReportsUploadedFilesList } from "@/components/Forms/reports/ReportsUploadedFilesList";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  updateMineReportSubmissions: PropTypes.func.isRequired,
  mineReportSubmissions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
};

const defaultProps = {
  mineReportSubmissions: [],
};

export const ReportSubmissions = (props) => {
  const uploadedFiles =
    props.mineReportSubmissions &&
    props.mineReportSubmissions.length > 0 &&
    props.mineReportSubmissions[props.mineReportSubmissions.length - 1].documents &&
    props.mineReportSubmissions[props.mineReportSubmissions.length - 1].documents.length > 0
      ? props.mineReportSubmissions[props.mineReportSubmissions.length - 1].documents.filter(
          (file) => !file.mine_document_guid
        )
      : [];

  const handleRemoveFile = (fileToRemove) => {
    let updatedSubmissions = props.mineReportSubmissions;
    updatedSubmissions[updatedSubmissions.length - 1].documents = reject(
      updatedSubmissions[updatedSubmissions.length - 1].documents,
      (file) => fileToRemove.document_manager_guid === file.document_manager_guid
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

  return (
    <div>
      {uploadedFiles.length > 0 && (
        <Field
          id="ReportAttachedFiles"
          name="ReportAttachedFiles"
          label="Documents"
          component={ReportsUploadedFilesList}
          files={uploadedFiles}
          onRemoveFile={handleRemoveFile}
        />
      )}
      <Field
        id="ReportFileUpload"
        name="ReportFileUpload"
        label="Upload Files"
        component={FileUpload}
        uploadUrl={MINE_REPORT_DOCUMENT(props.mineGuid)}
        onFileLoad={handleFileLoad}
      />
    </div>
  );
};

ReportSubmissions.propTypes = propTypes;
ReportSubmissions.defaultProps = defaultProps;

export default ReportSubmissions;

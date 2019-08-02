import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Form, Divider } from "antd";
import FileUpload from "@/components/common/FileUpload";
import { MINE_REPORT_DOCUMENT } from "@/constants/API";
import { ReportsUploadedFilesList } from "@/components/Forms/reports/ReportsUploadedFilesList";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mineReportSubmissions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  uploadedFiles: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
};

export const ReportSubmissions = (props) => {
  const hasSubmissions = props.mineReportSubmissions.length > 0;
  return (
    <div>
      <Divider orientation="left">
        <h5>Report Files</h5>
      </Divider>
      {props.uploadedFiles.length > 0 && (
        <Form.Item label="Attached files" style={{ paddingBottom: "10px" }}>
          <Field
            id="report_documents"
            name="report_documents"
            component={ReportsUploadedFilesList}
            files={props.uploadedFiles}
            onRemoveFile={props.onRemoveFile}
          />
        </Form.Item>
      )}
      {!hasSubmissions && (
        <Form.Item>
          <Field
            id="ReportFileUpload"
            name="ReportFileUpload"
            label="Upload Files"
            onFileLoad={(document_name, document_manager_guid) =>
              props.onFileLoad(document_name, document_manager_guid)
            }
            uploadUrl={MINE_REPORT_DOCUMENT(props.mineGuid)}
            component={FileUpload}
          />
        </Form.Item>
      )}
    </div>
  );
};

ReportSubmissions.propTypes = propTypes;

export default ReportSubmissions;

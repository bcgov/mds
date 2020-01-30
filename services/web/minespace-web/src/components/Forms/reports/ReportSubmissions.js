import React, { useState } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Form, Button } from "antd";
import { concat, reject } from "lodash";
import FileUpload from "@/components/common/FileUpload";
import { MINE_REPORT_DOCUMENT } from "@/constants/API";
import { ReportsUploadedFilesList } from "@/components/Forms/reports/ReportsUploadedFilesList";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mineReportSubmissions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  updateMineReportSubmissions: PropTypes.func.isRequired,
};

const defaultProps = {
  mineReportSubmissions: [],
};

export const ReportSubmissions = (props) => {
  const hasSubmissions = props.mineReportSubmissions.length > 0;
  const [updateFilesClicked, setUpdateFilesClicked] = useState(false);
  return [
    props.mineReportSubmissions.length > 0 && (
      <Form.Item label="Attached Files">
        <Field
          id="ReportAttachedFiles"
          name="ReportAttachedFiles"
          component={ReportsUploadedFilesList}
          files={props.mineReportSubmissions[props.mineReportSubmissions.length - 1].documents}
          onRemoveFile={(fileToRemove) => {
            let updatedSubmissions = props.mineReportSubmissions;
            updatedSubmissions[updatedSubmissions.length - 1].documents = reject(
              updatedSubmissions[updatedSubmissions.length - 1].documents,
              (file) => fileToRemove.document_manager_guid === file.document_manager_guid
            );
            // If this is the a the first submission, and all files are removed, then remove the empty submission.
            if (updatedSubmissions.length === 1 && updatedSubmissions[0].documents.length === 0) {
              updatedSubmissions = [];
            }
            props.updateMineReportSubmissions(updatedSubmissions);
          }}
          props={{ editing: updateFilesClicked }}
        />
      </Form.Item>
    ),
    (!hasSubmissions || updateFilesClicked) && (
      <Form.Item>
        <Field
          id="ReportFileUpload"
          name="ReportFileUpload"
          label="Upload Files"
          onFileLoad={(document_name, document_manager_guid) => {
            setUpdateFilesClicked(true);
            const updatedSubmissions =
              props.mineReportSubmissions && props.mineReportSubmissions.length > 0
                ? props.mineReportSubmissions
                : [{ documents: [] }];
            updatedSubmissions[updatedSubmissions.length - 1].documents = concat(
              updatedSubmissions[updatedSubmissions.length - 1].documents,
              {
                document_name,
                document_manager_guid,
              }
            );
            props.updateMineReportSubmissions(updatedSubmissions);
          }}
          uploadUrl={MINE_REPORT_DOCUMENT(props.mineGuid)}
          component={FileUpload}
        />
      </Form.Item>
    ),
    hasSubmissions && !updateFilesClicked && (
      <Button
        type="primary"
        onClick={() => {
          setUpdateFilesClicked(!updateFilesClicked);
          props.updateMineReportSubmissions([
            ...props.mineReportSubmissions,
            {
              documents:
                props.mineReportSubmissions.length > 0
                  ? props.mineReportSubmissions[props.mineReportSubmissions.length - 1].documents
                  : [],
            },
          ]);
        }}
      >
        Update Files
      </Button>
    ),
  ];
};

ReportSubmissions.propTypes = propTypes;
ReportSubmissions.defaultProps = defaultProps;

export default ReportSubmissions;

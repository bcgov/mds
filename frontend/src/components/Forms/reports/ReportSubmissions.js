import React, { useState } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Form, Divider, Button } from "antd";
import { concat, reject } from "lodash";
import FileUpload from "@/components/common/FileUpload";
import { MINE_REPORT_DOCUMENT } from "@/constants/API";
import { UploadedDocumentsTable } from "@/components/common/UploadedDocumentTable";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mineReportSubmissions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  updateMineReportSubmissions: PropTypes.func.isRequired,
};

const defaultProps = {
  mineReportSubmissions: [],
};

const updateSubmissionHandler = (mine_document_guid, props) => {
  const fileToRemove = props.mineReportSubmissions[
    props.mineReportSubmissions.length - 1
  ].documents.filter((doc) => doc.mine_document_guid === mine_document_guid)[0];
  let updatedSubmissions = props.mineReportSubmissions;
  console.log(fileToRemove);
  updatedSubmissions[updatedSubmissions.length - 1].documents = reject(
    updatedSubmissions[updatedSubmissions.length - 1].documents,
    (file) => fileToRemove.document_manager_guid === file.document_manager_guid
  );
  // If this is the a the first submission, and all files are removed, then remove the empty submission.
  if (updatedSubmissions.length === 1 && updatedSubmissions[0].documents.length === 0) {
    updatedSubmissions = [];
  }
  props.updateMineReportSubmissions(updatedSubmissions);
};

export const ReportSubmissions = (props) => {
  const hasSubmissions = props.mineReportSubmissions.length > 0;
  const [updateFilesClicked, setUpdateFilesClicked] = useState(false);
  return [
    <Divider orientation="left">
      <h5>Report Files</h5>
    </Divider>,
    props.mineReportSubmissions.length > 0 && (
      <UploadedDocumentsTable
        files={props.mineReportSubmissions[props.mineReportSubmissions.length - 1].documents}
        showRemove={updateFilesClicked}
        updateDocumentHandler={(mine_document_guid) =>
          updateSubmissionHandler(mine_document_guid, props)
        }
      />
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
      <div className="inline-flex flex-center">
        <Button
          className="center-mobile "
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
      </div>
    ),
  ];
};

ReportSubmissions.propTypes = propTypes;
ReportSubmissions.defaultProps = defaultProps;

export default ReportSubmissions;

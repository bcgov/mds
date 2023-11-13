import React, { useState } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button } from "antd";
import { concat, reject } from "lodash";
import { MINE_REPORT_DOCUMENT } from "@mds/common/constants/API";
import FileUpload from "@/components/common/FileUpload";
import LinkButton from "@/components/common/buttons/LinkButton";
import { UploadedDocumentsTable } from "@/components/common/UploadedDocumentTable";
import FormItemLabel from "@/components/common/FormItemLabel";
import { renderConfig } from "@/components/common/config";
import customPropTypes from "@/customPropTypes";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mineReportSubmissions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  updateMineReportSubmissions: PropTypes.func.isRequired,
  showReportHistory: PropTypes.func.isRequired,
  mineReportStatusOptions: customPropTypes.options.isRequired,
};

const defaultProps = {
  mineReportSubmissions: [],
};

const updateSubmissionHandler = (mine_document_guid, props) => {
  const fileToRemove = props.mineReportSubmissions[
    props.mineReportSubmissions.length - 1
  ].documents.find((doc) => doc.mine_document_guid === mine_document_guid);
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
};

export const ReportSubmissions = (props) => {
  const hasSubmissions = props.mineReportSubmissions.length > 0;
  const [updateFilesClicked, setUpdateFilesClicked] = useState(false);
  return (
    <React.Fragment>
      <FormItemLabel underline>Report Files</FormItemLabel>
      {hasSubmissions && (
        <React.Fragment>
          <div className="padding-lg--bottom">
            <UploadedDocumentsTable
              files={props.mineReportSubmissions[props.mineReportSubmissions.length - 1].documents}
              showRemove={updateFilesClicked}
              removeFileHandler={(mine_document_guid) =>
                updateSubmissionHandler(mine_document_guid, props)
              }
            />
          </div>
          <Form.Item>
            <Field
              id="mine_report_submission_status"
              name="mine_report_submission_status"
              label="Revision Status"
              data={props.mineReportStatusOptions}
              component={renderConfig.SELECT}
              defaultValue="NRQ"
            />
          </Form.Item>
        </React.Fragment>
      )}
      {(!hasSubmissions || updateFilesClicked) && (
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
      )}
      {hasSubmissions && !updateFilesClicked && (
        <div className="inline-flex padding-md--bottom flex-flow-column">
          <div className="center">
            <Button
              className="center center-mobile "
              type="primary"
              onClick={() => {
                setUpdateFilesClicked(!updateFilesClicked);
                props.updateMineReportSubmissions([
                  ...props.mineReportSubmissions,
                  {
                    documents:
                      props.mineReportSubmissions.length > 0
                        ? props.mineReportSubmissions[props.mineReportSubmissions.length - 1]
                            .documents
                        : [],
                  },
                ]);
              }}
            >
              Update Report Files
            </Button>
          </div>
          <div className="center">
            <LinkButton
              key="file_history"
              onClick={() => {
                props.showReportHistory();
              }}
            >
              See file history
            </LinkButton>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

ReportSubmissions.propTypes = propTypes;
ReportSubmissions.defaultProps = defaultProps;

export default ReportSubmissions;

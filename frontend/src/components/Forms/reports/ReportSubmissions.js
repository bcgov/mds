import React, { useState } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Form, Divider, Button } from "antd";
import { concat } from "lodash";
import FileUpload from "@/components/common/FileUpload";
import { MINE_REPORT_DOCUMENT } from "@/constants/API";
import { ReportsUploadedFilesList } from "@/components/Forms/reports/ReportsUploadedFilesList";
import LinkButton from "@/components/common/LinkButton";
import { UploadedDocumentsTable } from "@/components/common/UploadedDocumentTable";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mineReportSubmissions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  updateMineReportSubmissions: PropTypes.func.isRequired,
  toggleReportHistory: PropTypes.func.isRequired,
};

const defaultProps = {
  mineReportSubmissions: [],
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
        updateMineReportSubmissions={props.updateMineReportSubmissions}
        mineReportSubmissions={props.mineReportSubmissions}
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
        <div className="center">
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
                      ? props.mineReportSubmissions[props.mineReportSubmissions.length - 1]
                          .documents
                      : [],
                },
              ]);
            }}
          >
            Update Files
          </Button>
          <br />
          <LinkButton
            key="file_history"
            onClick={() => {
              props.toggleReportHistory();
            }}
          >
            See file history
          </LinkButton>
        </div>
      </div>
    ),
  ];
};

ReportSubmissions.propTypes = propTypes;
ReportSubmissions.defaultProps = defaultProps;

export default ReportSubmissions;

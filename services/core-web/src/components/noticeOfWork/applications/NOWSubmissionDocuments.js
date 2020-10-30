import React from "react";
import { PropTypes } from "prop-types";
import { Table, Badge } from "antd";
import { ImportOutlined } from "@ant-design/icons";
import { formatDateTime } from "@common/utils/helpers";
import { isEmpty } from "lodash";
import {
  downloadNowDocument,
  downloadFileFromDocumentManager,
} from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@common/constants/strings";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  now_application_guid: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(PropTypes.any),
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  selectedRows: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = { selectedRows: null, importNowSubmissionDocumentsJob: {}, documents: [] };

const transformDocuments = (documents, importNowSubmissionDocumentsJob, now_application_guid) =>
  documents &&
  documents.map((document) => {
    const importNowSubmissionDocument =
      !isEmpty(importNowSubmissionDocumentsJob) &&
      !isEmpty(importNowSubmissionDocumentsJob.import_now_submission_documents)
        ? importNowSubmissionDocumentsJob.import_now_submission_documents.find(
            (doc) => doc.submission_document_id === document.id
          )
        : null;
    return {
      key: document.id,
      now_application_guid,
      filename: document.filename || Strings.EMPTY_FIELD,
      url: document.documenturl,
      category: document.documenttype || Strings.EMPTY_FIELD,
      description: document.description || Strings.EMPTY_FIELD,
      document_manager_guid: document.document_manager_document_guid,
      importNowSubmissionDocument,
    };
  });

export const NOWSubmissionDocuments = (props) => {
  const fileNameColumn = props.selectedRows
    ? {
        title: "File Name",
        dataIndex: "filename",
        key: "filename",
        render: (text) => <div title="File Name">{text}</div>,
      }
    : {
        title: "File Name",
        dataIndex: "filename",
        key: "filename",
        render: (text, record) => (
          <div title="File Name">
            <LinkButton
              onClick={() =>
                record.document_manager_guid
                  ? downloadFileFromDocumentManager({
                      document_manager_guid: record.document_manager_guid,
                      document_name: record.filename,
                    })
                  : downloadNowDocument(record.key, record.now_application_guid, record.filename)
              }
            >
              <span>{text}</span>
            </LinkButton>
          </div>
        ),
      };

  const otherColumns = [
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => (a.category > b.category ? -1 : 1),
      defaultSortOrder: "descend",
      render: (text) => <div title="Category">{text}</div>,
    },
    {
      title: "Proponent Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <div title="Proponent Description">{text}</div>,
    },
    {
      title: "Import Status",
      key: "import_status",
      render: (text, record) => {
        let statusBadgeType = "warning";
        let statusText = "Not Started";
        if (record.document_manager_guid) {
          statusBadgeType = "success";
          statusText = "Success";
        } else if (record.importNowSubmissionDocument) {
          if (record.importNowSubmissionDocument.error) {
            statusBadgeType = "error";
            statusText = "Error";
          } else {
            statusBadgeType = "processing";
            statusText = "In Progress";
          }
        }

        return (
          <div title="Import Status" style={{ minWidth: 100 }}>
            <Badge status={statusBadgeType} text={statusText} />
          </div>
        );
      },
    },
  ];

  const columns = [fileNameColumn, ...otherColumns];
  const dataSource = transformDocuments(
    props.documents,
    props.importNowSubmissionDocumentsJob,
    props.now_application_guid
  );

  const renderImportJobStatus = () => {
    const jobStatus = props.importNowSubmissionDocumentsJob
      ? props.importNowSubmissionDocumentsJob.import_now_submission_documents_job_status_code
      : null;

    const jobStartTime = props.importNowSubmissionDocumentsJob
      ? props.importNowSubmissionDocumentsJob.start_timestamp
      : null;
    const jobEndTime = props.importNowSubmissionDocumentsJob
      ? props.importNowSubmissionDocumentsJob.end_timestamp
      : null;

    // TODO: Bring over the status codes as static content and create a hash lookup for getting the descriptions.
    let jobStatusDescription = "Not Applicable";
    let jobStatusMessage =
      "An import job will be started once the Notice of Work has been verified.";
    if (jobStatus === "NOT") {
      jobStatusDescription = "Not Started";
      jobStatusMessage = "An import job has been created but hasn't started.";
    } else if (jobStatus === "SUC") {
      jobStatusDescription = "Success";
      jobStatusMessage = "All submission documents have been successfully imported into Core.";
    } else if (jobStatus === "FAI") {
      jobStatusDescription = "Failure";
      jobStatusMessage = `The import job has failed. The next attempt will be performed on ${formatDateTime(
        props.importNowSubmissionDocumentsJob.next_attempt_timestamp
      )}.`;
    } else if (jobStatus === "INP") {
      jobStatusDescription = "In Progress";
      jobStatusMessage = "An import job is currently in progress.";
    } else if (jobStatus === "DEL") {
      jobStatusDescription = "Delayed";
      jobStatusMessage = `The previous job to import the documents failed. The next attempt will be performed on ${formatDateTime(
        props.importNowSubmissionDocumentsJob.next_attempt_timestamp
      )}.`;
    }

    const amountToImport = props.documents.length;
    const amountImported = props.documents.filter((doc) => doc.document_manager_document_guid)
      .length;

    return (
      <div
        style={{
          display: "inline-block",
          backgroundColor: "#f4f0f0",
          padding: 16,
          borderRadius: 5,
          marginBottom: 24,
          marginTop: 12,
        }}
      >
        <p style={{ fontWeight: "bold" }}>
          <ImportOutlined style={{ marginRight: 8 }} />
          Submission Documents Import Job
        </p>
        <div style={{ marginLeft: 24 }}>
          <p>{jobStatusMessage}</p>
          <p>
            <b>Status:</b> {jobStatusDescription}
            <br />
            <b>Start time:</b> {jobStartTime ? formatDateTime(jobStartTime) : Strings.EMPTY_FIELD}
            <br />
            <b>End time:</b> {jobEndTime ? formatDateTime(jobEndTime) : Strings.EMPTY_FIELD}
            <br />
            <b>Progress:</b> {amountImported}/{amountToImport} imported
            <br />
            <b>Attempt:</b> {props.importNowSubmissionDocumentsJob.attempt}
            <br />
          </p>
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderImportJobStatus()}
      <p>
        These files were included in the original application from the proponent.
        {props.selectedRows &&
          " You cannot select documents that have not been successfully imported into Core."}
      </p>
      <br />
      <Table
        align="left"
        pagination={false}
        columns={columns}
        dataSource={dataSource}
        locale={{
          emptyText: "No Data Yet",
        }}
        rowSelection={
          props.selectedRows
            ? {
                selectedRowKeys: props.selectedRows.selectedSubmissionRows,
                onChange: (selectedRowKeys) => {
                  props.selectedRows.setSelectedSubmissionRows(selectedRowKeys);
                },
                getCheckboxProps: (record) => ({
                  disabled: record && !record.document_manager_guid,
                }),
              }
            : null
        }
      />
    </div>
  );
};

NOWSubmissionDocuments.propTypes = propTypes;
NOWSubmissionDocuments.defaultProps = defaultProps;

export default NOWSubmissionDocuments;

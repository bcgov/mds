import React, { useState } from "react";
import { PropTypes } from "prop-types";
import { Table, Badge, Tooltip, Button } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { ImportOutlined, ReloadOutlined } from "@ant-design/icons";
import { formatDateTime } from "@common/utils/helpers";
import { isEmpty } from "lodash";
import { Field } from "redux-form";
import { downloadNowDocument } from "@common/utils/actionlessNetworkCalls";
import { openDocument } from "@/components/syncfusion/DocumentViewer";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Strings from "@common/constants/strings";
import DocumentLink from "@/components/common/DocumentLink";
import { renderConfig } from "@/components/common/config";
import * as Permission from "@/constants/permissions";
import {
  createNoticeOfWorkApplicationImportSubmissionDocumentsJob,
  fetchImportNoticeOfWorkSubmissionDocumentsJob,
} from "@common/actionCreators/noticeOfWorkActionCreator";

const propTypes = {
  now_application_guid: PropTypes.string.isRequired,
  openDocument: PropTypes.func.isRequired,
  createNoticeOfWorkApplicationImportSubmissionDocumentsJob: PropTypes.func.isRequired,
  fetchImportNoticeOfWorkSubmissionDocumentsJob: PropTypes.func.isRequired,
  documents: PropTypes.arrayOf(PropTypes.any),
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  selectedRows: PropTypes.objectOf(PropTypes.any),
  displayTableDescription: PropTypes.bool,
  hideImportStatusColumn: PropTypes.bool,
  hideJobStatusColumn: PropTypes.bool,
  showPreambleFileMetadata: PropTypes.bool,
  editPreambleFileMetadata: PropTypes.bool,
};

const defaultProps = {
  selectedRows: null,
  importNowSubmissionDocumentsJob: {},
  documents: [],
  displayTableDescription: false,
  hideImportStatusColumn: false,
  hideJobStatusColumn: false,
  showPreambleFileMetadata: false,
  editPreambleFileMetadata: false,
};

const transformDocuments = (documents, importNowSubmissionDocumentsJob, now_application_guid) =>
  documents &&
  documents.map((document) => {
    const importNowSubmissionDocument =
      !isEmpty(importNowSubmissionDocumentsJob) &&
      !isEmpty(importNowSubmissionDocumentsJob.import_now_submission_documents)
        ? importNowSubmissionDocumentsJob.import_now_submission_documents.find((doc) => {
            return (
              doc.submission_document_file_name === document.filename &&
              doc.submission_document_url === document.documenturl &&
              doc.submission_document_type === document.documenttype &&
              doc.submission_document_message_id === document.messageid
            );
          })
        : null;
    return {
      key: document.mine_document_guid ?? document.id,
      now_application_document_xref_guid: document.now_application_document_xref_guid,
      now_application_guid,
      filename: document.filename || Strings.EMPTY_FIELD,
      url: document.documenturl,
      category: document.documenttype || Strings.EMPTY_FIELD,
      description: document.description || Strings.EMPTY_FIELD,
      document_manager_guid: document.document_manager_guid,
      mine_document_guid: document.mine_document_guid,
      importNowSubmissionDocument,
    };
  });

export const NOWSubmissionDocuments = (props) => {
  const [isLoaded, setIsLoaded] = useState(true);

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
            <DocumentLink
              documentManagerGuid={record.document_manager_guid}
              documentName={record.filename}
              onClickAlternative={() =>
                downloadNowDocument(record.key, record.now_application_guid, record.filename)
              }
            />
          </div>
        ),
      };

  const fileMetadataColumns = [
    {
      title: "Title",
      dataIndex: "preamble_title",
      key: "preamble_title",
      render: (text, record) => (
        <div title="Title">
          <Field
            id={`${record.now_application_document_xref_guid}_preamble_title`}
            name={`${record.now_application_document_xref_guid}_preamble_title`}
            placeholder={(props.editPreambleFileMetadata && "Enter Title") || null}
            component={renderConfig.FIELD}
            disabled={!props.editPreambleFileMetadata}
          />
        </div>
      ),
    },
    {
      title: "Author",
      dataIndex: "preamble_author",
      key: "preamble_author",
      render: (text, record) => (
        <div title="Author">
          <Field
            id={`${record.now_application_document_xref_guid}_preamble_author`}
            name={`${record.now_application_document_xref_guid}_preamble_author`}
            placeholder={(props.editPreambleFileMetadata && "Enter Author") || null}
            component={renderConfig.FIELD}
            disabled={!props.editPreambleFileMetadata}
          />
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "preamble_date",
      key: "preamble_date",
      render: (text, record) => (
        <div title="Date">
          <Field
            id={`${record.now_application_document_xref_guid}_preamble_date`}
            name={`${record.now_application_document_xref_guid}_preamble_date`}
            component={renderConfig.DATE}
            placeholder={(props.editPreambleFileMetadata && "YYYY-MM-DD") || null}
            disabled={!props.editPreambleFileMetadata}
          />
        </div>
      ),
    },
  ];

  let otherColumns = [
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
  ];

  if (!props.hideImportStatusColumn) {
    otherColumns = [
      ...otherColumns,
      {
        title: "Import Status",
        key: "import_status",
        render: (text, record) => {
          let statusBadgeType = "warning";
          let statusText = "Not Started";
          let error = null;
          if (record.mine_document_guid) {
            statusBadgeType = "success";
            statusText = "Success";
          } else if (record.importNowSubmissionDocument) {
            if (record.importNowSubmissionDocument.error) {
              // eslint-disable-next-line prefer-destructuring
              error = record.importNowSubmissionDocument.error;
              statusBadgeType = "error";
              statusText = "Error";
            } else {
              statusBadgeType = "processing";
              statusText = "In Progress";
            }
          }

          return (
            <Tooltip title={error || null} placement="right">
              <div title="Import Status" style={{ minWidth: 100 }}>
                <Badge status={statusBadgeType} text={statusText} />
              </div>
            </Tooltip>
          );
        },
      },
    ];
  }

  let columns = [fileNameColumn, ...otherColumns];

  if (props.showPreambleFileMetadata) {
    columns = [...fileMetadataColumns, ...columns];
  }

  const dataSource = transformDocuments(
    props.documents,
    props.importNowSubmissionDocumentsJob,
    props.now_application_guid
  );

  const renderImportJobStatus = () => {
    const importJobExists = !isEmpty(props.importNowSubmissionDocumentsJob);

    const jobStatus = importJobExists
      ? props.importNowSubmissionDocumentsJob.import_now_submission_documents_job_status_code
      : null;

    const jobStartTime = importJobExists
      ? props.importNowSubmissionDocumentsJob.start_timestamp
      : null;
    const jobEndTime = importJobExists ? props.importNowSubmissionDocumentsJob.end_timestamp : null;
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
      jobStatusMessage = `The previous attempt to import the remaining documents failed. The next attempt will be performed on ${formatDateTime(
        props.importNowSubmissionDocumentsJob.next_attempt_timestamp
      )}.`;
    }
    const importDocuments =
      importJobExists &&
      !isEmpty(props.importNowSubmissionDocumentsJob.import_now_submission_documents)
        ? props.importNowSubmissionDocumentsJob.import_now_submission_documents
        : [];
    const amountToImport = importDocuments.length;
    const amountImported = importDocuments.filter((doc) => doc.document_id).length;

    const triggerImportJob = () => {
      setIsLoaded(false);
      return props
        .createNoticeOfWorkApplicationImportSubmissionDocumentsJob(props.now_application_guid)
        .then(() =>
          new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
            props.fetchImportNoticeOfWorkSubmissionDocumentsJob(props.now_application_guid)
          )
        )
        .finally(() => setIsLoaded(true));
    };

    const ReimportButton = () => (
      <AuthorizationWrapper permission={Permission.ADMIN}>
        <Button
          icon={<ReloadOutlined />}
          style={{ float: "right", marginTop: 0 }}
          onClick={triggerImportJob}
          loading={!isLoaded}
        >
          Reimport
        </Button>
      </AuthorizationWrapper>
    );

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
          <ReimportButton />
        </p>
        <div style={{ marginLeft: 24 }}>
          <p>{jobStatusMessage}</p>
          <p>
            <b>Status: </b>
            {jobStatusDescription}
            <br />
            <b>Start time: </b>
            {jobStartTime ? formatDateTime(jobStartTime) : Strings.EMPTY_FIELD}
            <br />
            <b>End time: </b>
            {jobEndTime ? formatDateTime(jobEndTime) : Strings.EMPTY_FIELD}
            <br />
            <b>Progress: </b>
            {importJobExists ? `${amountImported}/${amountToImport} imported` : Strings.EMPTY_FIELD}
            <br />
            <b>Attempt: </b>
            {importJobExists ? props.importNowSubmissionDocumentsJob.attempt : Strings.EMPTY_FIELD}
            <br />
          </p>
        </div>
      </div>
    );
  };

  return (
    <div>
      {!props.hideJobStatusColumn && renderImportJobStatus()}
      {props.displayTableDescription && (
        <>
          <p>
            These files were included in the original application from the proponent.
            {props.selectedRows &&
              " You cannot select documents that have not been successfully imported into Core."}
          </p>
        </>
      )}
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
                  disabled: record && !record.mine_document_guid,
                }),
              }
            : null
        }
      />
    </div>
  );
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createNoticeOfWorkApplicationImportSubmissionDocumentsJob,
      fetchImportNoticeOfWorkSubmissionDocumentsJob,
      openDocument,
    },
    dispatch
  );

NOWSubmissionDocuments.propTypes = propTypes;
NOWSubmissionDocuments.defaultProps = defaultProps;

export default connect(null, mapDispatchToProps)(NOWSubmissionDocuments);

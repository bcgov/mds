import React from "react";
import { PropTypes } from "prop-types";
import { Table, Badge } from "antd";
import { isEmpty } from "lodash";
import {
  downloadNowDocument,
  downloadFileFromDocumentManager,
} from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@common/constants/strings";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  now_application_guid: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(PropTypes.any).isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  selectedRows: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = { selectedRows: null, importNowSubmissionDocumentsJob: {} };

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
          <div title="Import Status">
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

  return (
    <div>
      <div>
        <p>These files were included in the original application from the proponent.</p>
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
                }
              : null
          }
        />
      </div>
    </div>
  );
};

NOWSubmissionDocuments.propTypes = propTypes;
NOWSubmissionDocuments.defaultProps = defaultProps;

export default NOWSubmissionDocuments;

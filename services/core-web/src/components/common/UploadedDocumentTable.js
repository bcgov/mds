/* eslint-disable */
import React from "react";
import { Table } from "antd";
import PropTypes from "prop-types";
import moment from "moment";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { formatDateTime, truncateFilename } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";
import * as Strings from "@common/constants/strings";

const propTypes = {
  files: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  showRemove: PropTypes.bool,
  removeFileHandler: PropTypes.func,
  showCategory: PropTypes.bool,
  documentTypeOptionsHash: PropTypes.objectOf(PropTypes.Strings),
};

const defaultProps = {
  showRemove: false,
  removeFileHandler: () => {},
  showCategory: true,
  documentTypeOptionsHash: {},
};

const fileColumn = {
  title: "File Name",
  dataIndex: "file_name",
  key: "file_name",
  sorter: (a, b) => a.file_name.localeCompare(b.file_name),
  render: (text, record) => (
    <div title="File Name">
      <div key={record.file.mine_document_guid}>
        <LinkButton
          onClick={() => downloadFileFromDocumentManager(record.file)}
          title={record.file_name}
        >
          {truncateFilename(record.file_name)}
        </LinkButton>
      </div>
    </div>
  ),
};

const categoryColumn = {
  title: "Document Category",
  dataIndex: "now_application_document_type_code",
  key: "now_application_document_type_code",
  render: (text, record) => (
    <div title="Document Category">
      {record.documentTypeOptionsHash[text] || Strings.EMPTY_FIELD}
    </div>
  ),
};

const updateDateTimeColumn = {
  title: "Upload Date/Time",
  dataIndex: "upload_date",
  key: "upload_date",
  sorter: (a, b) => (moment(a.upload_date) > moment(b.upload_date) ? -1 : 1),
  render: (text, record) => (
    <div title="Due">{formatDateTime(record.file.upload_date) || "Pending"}</div>
  ),
};

const removeColumn = {
  dataIndex: "remove",
  key: "remove",
  render: (text, record) =>
    record.showRemove && (
      <div title="remove">
        <a
          onClick={() => {
            record.updateDocumentHandler(record.file.mine_document_guid);
          }}
        >
          Remove
        </a>
      </div>
    ),
};

const columns = (showRemove, showCategory) => {
  const columns = showRemove
    ? [fileColumn, updateDateTimeColumn, removeColumn]
    : [fileColumn, updateDateTimeColumn];

  showCategory ? columns.splice(1, 0, categoryColumn) : columns;
  return columns;
};

const transformRowData = (file, showRemove, updateDocumentHandler, documentTypeOptionsHash) => ({
  file,
  file_name: file.document_name,
  showRemove,
  updateDocumentHandler,
  documentTypeOptionsHash,
  ...file,
});

export const UploadedDocumentsTable = (props) => {
  return (
    <Table
      align="left"
      pagination={false}
      columns={columns(props.showRemove, props.showCategory)}
      dataSource={props.files.map((file) =>
        transformRowData(
          file,
          props.showRemove,
          props.removeFileHandler,
          props.documentTypeOptionsHash
        )
      )}
      locale={{ emptyText: "No documents." }}
    />
  );
};

UploadedDocumentsTable.propTypes = propTypes;
UploadedDocumentsTable.defaultProps = defaultProps;

export default UploadedDocumentsTable;

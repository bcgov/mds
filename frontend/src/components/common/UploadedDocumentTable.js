/* eslint-disable */
import React from "react";
import { Table } from "antd";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";
import { downloadFileFromDocumentManager } from "@/utils/actionlessNetworkCalls";

const propTypes = {
  files: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  showRemove: PropTypes.bool,
  removeFileHandler: PropTypes.func,
};

const defaultProps = { showRemove: true, removeFileHandler: () => {} };

const fileColumn = {
  title: "File Name",
  dataIndex: "file_name",
  key: "file_name",
  sorter: (a, b) => a.file_name.localeCompare(b.file_name),
  render: (text, record) => (
    <div title="File Name">
      <div key={record.file.mine_document_guid}>
        <LinkButton
          key={record.file.mine_document_guid}
          onClick={() => downloadFileFromDocumentManager(record.file)}
        >
          {record.file_name}
        </LinkButton>
      </div>
    </div>
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

const columns = (showRemove) => (showRemove ? [fileColumn, removeColumn] : [fileColumn]);

const transformRowData = (file, showRemove, updateDocumentHandler) => ({
  key: file.mine_document_guid,
  file,
  file_name: file.document_name,
  showRemove: showRemove,
  updateDocumentHandler: updateDocumentHandler,
});

export const UploadedDocumentsTable = (props) => (
  <Table
    align="left"
    pagination={false}
    columns={columns(props.showRemove)}
    dataSource={props.files.map((file) =>
      transformRowData(file, props.showRemove, props.updateDocumentHandler)
    )}
  />
);

UploadedDocumentsTable.propTypes = propTypes;
UploadedDocumentsTable.defaultProps = defaultProps;

export default UploadedDocumentsTable;

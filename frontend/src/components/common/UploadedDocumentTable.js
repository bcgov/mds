/* eslint-disable */
import React from "react";
import { Table } from "antd";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";
import { downloadFileFromDocumentManager } from "@/utils/actionlessNetworkCalls";

/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  files: PropTypes.arrayOf(PropTypes.objectOf(CustomPropTypes.mineReport)).isRequired,
  showRemove: PropTypes.bool,
  updateDocumentHandler: PropTypes.func.isRequired,
};

const defaultProps = { showRemove: false, documentSet: [] };

const columns = [
  {
    title: "File Name",
    dataIndex: "file_name",
    key: "file_name",
    sorter: (a, b) => a.report_name.localeCompare(b.report_name),
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
  },
  {
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
  },
];

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
    columns={columns}
    dataSource={props.files.map((file) =>
      transformRowData(file, props.showRemove, props.updateDocumentHandler)
    )}
  />
);

UploadedDocumentsTable.propTypes = propTypes;
UploadedDocumentsTable.defaultProps = defaultProps;

export default UploadedDocumentsTable;

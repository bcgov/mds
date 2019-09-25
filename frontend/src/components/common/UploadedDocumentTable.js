/* eslint-disable */
import React from "react";
import { Table } from "antd";
import PropTypes from "prop-types";
import { reject } from "lodash";
import { formatDateTime } from "@/utils/helpers";
import * as Strings from "@/constants/strings";
import { COLOR } from "@/constants/styles";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";
import { downloadFileFromDocumentManager } from "@/utils/actionlessNetworkCalls";

/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  files: PropTypes.arrayOf(PropTypes.objectOf(CustomPropTypes.mineReport)).isRequired,
  showRemove: PropTypes.bool,
  updateMineReportSubmissions: PropTypes.func.isRequired,
  mineReportSubmissions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
};

const defaultProps = { showRemove: false, mineReportSubmissions: [] };

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
            key={record.mine_document_guid}
            onClick={() => downloadFileFromDocumentManager(record.file)}
          >
            {record.file_name}
          </LinkButton>
        </div>
      </div>
    ),
  },
  {
    title: "Upload Date/Time",
    dataIndex: "upload_date",
    key: "upload_date",
    sorter: (a, b) => (moment(a.upload_date) > moment(b.upload_date) ? -1 : 1),
    render: (text, record) => (
      <div title="Due">{formatDateTime(record.file.upload_date) || Strings.EMPTY_FIELD}</div>
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
              let fileToRemove = record.file;
              let updatedSubmissions = record.mineReportSubmissions;
              updatedSubmissions[updatedSubmissions.length - 1].documents = reject(
                updatedSubmissions[updatedSubmissions.length - 1].documents,
                (file) => fileToRemove.document_manager_guid === file.document_manager_guid
              );
              // If this is the a the first submission, and all files are removed, then remove the empty submission.
              if (updatedSubmissions.length === 1 && updatedSubmissions[0].documents.length === 0) {
                updatedSubmissions = [];
              }
              record.updateMineReportSubmissions(updatedSubmissions);
            }}
          >
            Remove
          </a>
        </div>
      ),
  },
];

const transformRowData = (file, showRemove, updateMineReportSubmissions, mineReportSubmissions) => {
  console.log(file);
  return {
    key: file.mine_document_guid,
    file,
    file_name: file.document_name,
    showRemove: showRemove,
    updateMineReportSubmissions: updateMineReportSubmissions,
    mineReportSubmissions: mineReportSubmissions,
  };
};

export const UploadedDocumentsTable = (props) => (
  <Table
    align="left"
    pagination={false}
    columns={columns}
    dataSource={props.files.map((file) =>
      transformRowData(
        file,
        props.showRemove,
        props.updateMineReportSubmissions,
        props.mineReportSubmissions
      )
    )}
  />
);

UploadedDocumentsTable.propTypes = propTypes;
UploadedDocumentsTable.defaultProps = defaultProps;

export default UploadedDocumentsTable;

/* eslint-disable */
import React from "react";
import { Table } from "antd";
import moment from "moment";
import PropTypes from "prop-types";
import NullScreen from "@/components/common/NullScreen";
import * as Strings from "@/constants/strings";
import { formatDate } from "@/utils/helpers";
import { COLOR } from "@/constants/styles";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { MineReportActions } from "@/components/mine/Reports/MineReportActions";
import LinkButton from "@/components/common/LinkButton";
import { downloadFileFromDocumentManager } from "@/utils/actionlessNetworkCalls";
import TableLoadingWrapper from "@/components/common/wrappers/TableLoadingWrapper";
import { getTableHeaders, truncateFilename } from "@/utils/helpers";

const { errorRed } = COLOR;

/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  openEditReportModal: PropTypes.func.isRequired,
  handleEditReport: PropTypes.func.isRequired,
  handleRemoveReport: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

const defaultProps = {};

const columns = [
  {
    title: "Report Name",
    dataIndex: "report_name",
    key: "report_name",
    sorter: (a, b) => a.report_name.localeCompare(b.report_name),
    render: (text, record) => (
      <div title="Report Name" style={record.isOverdue ? { color: errorRed } : {}}>
        {record.report_name}
      </div>
    ),
  },
  {
    title: "Compliance Year/Period",
    dataIndex: "submission_year",
    key: "submission_year",
    sorter: (a, b) => (a.submission_year > b.submission_year ? -1 : 1),
    render: (text, record) => (
      <div title="Year" style={record.isOverdue ? { color: errorRed } : {}}>
        {record.submission_year}
      </div>
    ),
  },
  {
    title: "Due",
    dataIndex: "due_date",
    key: "due_date",
    sorter: (a, b) => (moment(a.due_date) > moment(b.due_date) ? -1 : 1),
    render: (text, record) => (
      <div title="Due" style={record.isOverdue ? { color: errorRed } : {}}>
        {formatDate(record.due_date) || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "Requested By",
    dataIndex: "created_by_idir",
    key: "created_by_idir",
    render: (text, record) => <div title="Due">{text}</div>,
  },
  {
    title: "Received",
    dataIndex: "received_date",
    key: "received_date",
    sorter: (a, b) => (moment(a.received_date) > moment(b.received_date) ? -1 : 1),
    render: (text, record) => (
      <div title="Received" style={record.isOverdue ? { color: errorRed } : {}}>
        {formatDate(record.received_date) || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "Documents",
    dataIndex: "documents",
    key: "documents_key",
    render: (text, record) => (
      <div title="Documents">
        <ul>
          {record.report.mine_report_submissions.length > 0 &&
          record.report.mine_report_submissions[record.report.mine_report_submissions.length - 1]
            .documents.length > 0
            ? record.report.mine_report_submissions[
                record.report.mine_report_submissions.length - 1
              ].documents.map((file) => (
                <li key={file.mine_document_guid}>
                  <div title={file.document_name}>
                    <LinkButton
                      key={file.mine_document_guid}
                      onClick={() => downloadFileFromDocumentManager(file)}
                    >
                      {truncateFilename(file.document_name)}
                    </LinkButton>
                  </div>
                </li>
              ))
            : Strings.EMPTY_FIELD}
        </ul>
      </div>
    ),
  },
  {
    title: "",
    dataIndex: "record",
    render: (text, record) => {
      return (
        <div title="" align="right">
          <AuthorizationWrapper permission={Permission.EDIT_REPORTS}>
            <MineReportActions
              mineReport={record.report}
              openEditReportModal={record.openEditReportModal}
              handleEditReport={record.handleEditReport}
              handleRemoveReport={record.handleRemoveReport}
            />
          </AuthorizationWrapper>
        </div>
      );
    },
  },
];

const transformRowData = (report, openEditReportModal, handleEditReport, handleRemoveReport) => ({
  key: report.report_guid,
  documents_key: `${report.report_guid}_documents`,
  report,
  report_name: report.report_name,
  due_date: report.due_date,
  created_by_idir: report.created_by_idir,
  received_date: report.received_date,
  submission_year: report.submission_year,
  openEditReportModal,
  handleEditReport,
  handleRemoveReport,
});

export const MineReportTable = (props) => (
  <TableLoadingWrapper condition={props.isLoaded} tableHeaders={getTableHeaders(columns)}>
    <Table
      align="left"
      pagination={false}
      columns={columns}
      locale={{ emptyText: <NullScreen type="reports" /> }}
      dataSource={props.mineReports.map((r) =>
        transformRowData(
          r,
          props.openEditReportModal,
          props.handleEditReport,
          props.handleRemoveReport
        )
      )}
    />
  </TableLoadingWrapper>
);

MineReportTable.propTypes = propTypes;
MineReportTable.defaultProps = defaultProps;

export default MineReportTable;

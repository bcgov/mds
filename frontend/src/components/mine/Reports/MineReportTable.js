import React from "react";
import { Table } from "antd";
import NullScreen from "@/components/common/NullScreen";
import * as Strings from "@/constants/strings";
import moment from "moment";
import { formatDate } from "@/utils/helpers";
import PropTypes from "prop-types";
import { COLOR } from "@/constants/styles";

const { errorRed } = COLOR;

/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  // mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport),
  mineReports: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  openEditReportModal: PropTypes.func.isRequired,
};

const defaultProps = {};

const columns = [
  {
    title: "Year",
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
];

const transformRowData = (report, openEditReportModal) => ({
  key: report.report_guid,
  report,
  report_name: report.report_name,
  due_date: report.due_date,
  submission_year: report.submission_year,
  openEditReportModal,
  // documents: report.submissions.sort((a, b) => (a.received_date < b.received_date ? 1 : -1))[0]
  //  .documents,
});

export const MineReportTable = (props) => (
  <Table
    align="left"
    pagination={false}
    columns={columns}
    locale={{ emptyText: <NullScreen type="reports" /> }}
    dataSource={props.mineReports.map((r) => transformRowData(r, props.openEditReportModal))}
  />
);

MineReportTable.propTypes = propTypes;
MineReportTable.defaultProps = defaultProps;

export default MineReportTable;

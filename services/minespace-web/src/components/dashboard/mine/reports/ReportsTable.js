/* eslint-disable */

import React from "react";
import { Table, Button } from "antd";
import moment from "moment";
import PropTypes from "prop-types";
import * as Strings from "@/constants/strings";
import { formatDate } from "@/utils/helpers";
import { EDIT_PENCIL } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  openEditReportModal: PropTypes.func.isRequired,
  handleEditReport: PropTypes.func.isRequired,
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
      <div title="Report Name" className={record.isOverdue ? "color-error" : ""}>
        {record.report_name}
      </div>
    ),
  },
  {
    title: "Compliance Period",
    dataIndex: "submission_year",
    key: "submission_year",
    sorter: (a, b) => (a.submission_year > b.submission_year ? -1 : 1),
    render: (text, record) => (
      <div title="Compliance Period" className={record.isOverdue ? "color-error" : ""}>
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
      <div title="Due" className={record.isOverdue ? "color-error" : ""}>
        {formatDate(record.due_date) || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "Submitted On",
    dataIndex: "received_date",
    key: "received_date",
    sorter: (a, b) => (moment(a.received_date) > moment(b.received_date) ? -1 : 1),
    render: (text, record) => (
      <div title="Submitted On" className={record.isOverdue ? "color-error" : ""}>
        {formatDate(record.received_date) || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  // NOTE: This is a newly requested column.
  {
    title: "Submitted By",
    dataIndex: "submitted_by",
    key: "submitted_by",
    // sorter: (a, b) => (moment(a.received_date) > moment(b.received_date) ? -1 : 1),
    render: (text, record) => (
      <div title="Submitted By" className={record.isOverdue ? "color-error" : ""}>
        {text || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  // NOTE: This is a newly requested column. Brian: "Update table to include this for both
  // gov and industry - this is available data MM"
  {
    title: "Requested By",
    dataIndex: "requested_by",
    key: "requested_by",
    // sorter: (a, b) => (moment(a.received_date) > moment(b.received_date) ? -1 : 1),
    render: (text, record) => (
      <div title="Requested By" className={record.isOverdue ? "color-error" : ""}>
        {text || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  // NOTE: This is a newly requested column.
  {
    title: "Documents",
    dataIndex: "documents",
    key: "documents",
    // sorter: (a, b) => (moment(a.received_date) > moment(b.received_date) ? -1 : 1),
    render: (text, record) => (
      <div title="Documents" className={record.isOverdue ? "color-error" : ""}>
        {text || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "",
    dataIndex: "record",
    render: (text, record) => {
      return (
        <div title="" align="right">
          <Button
            type="link"
            onClick={(event) =>
              record.openEditReportModal(event, record.handleEditReport, record.mineReport)
            }
          >
            <img src={EDIT_PENCIL} alt="Edit" />
          </Button>
        </div>
      );
    },
  },
];

const transformRowData = (report, openEditReportModal, handleEditReport, handleRemoveReport) => ({
  key: report.report_guid,
  report,
  report_name: report.report_name,
  due_date: report.due_date,
  received_date: report.received_date,
  submission_year: report.submission_year,
  openEditReportModal,
  handleEditReport,
  handleRemoveReport,
});

export const ReportsTable = (props) => {
  console.log(props);

  return (
    <Table
      size="small"
      pagination={false}
      loading={!props.isLoaded}
      columns={columns}
      locale={{ emptyText: "This mine has no report data." }}
      dataSource={props.mineReports.map((record) =>
        transformRowData(
          record,
          props.openEditReportModal,
          props.handleEditReport,
          props.handleRemoveReport
        )
      )}
    />
  );
};

ReportsTable.propTypes = propTypes;
ReportsTable.defaultProps = defaultProps;

export default ReportsTable;

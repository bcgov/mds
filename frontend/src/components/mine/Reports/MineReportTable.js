import React from "react";
import { Table, Button } from "antd";
import moment from "moment";
import PropTypes from "prop-types";
import NullScreen from "@/components/common/NullScreen";
import * as Strings from "@/constants/strings";
import { formatDate } from "@/utils/helpers";
import { COLOR } from "@/constants/styles";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { BRAND_PENCIL } from "@/constants/assets";

const { errorRed } = COLOR;

/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  // mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport),
  mineReports: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  openEditReportModal: PropTypes.func.isRequired,
  handleEditReport: PropTypes.func.isRequired,
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
    title: "",
    dataIndex: "openEditReportModal",
    render: (text, record) => (
      <div title="" align="right">
        <AuthorizationWrapper permission={Permission.EDIT_REPORTS}>
          <Button
            type="primary"
            size="small"
            ghost
            onClick={(event) =>
              record.openEditReportModal(event, record.handleEditReport, record.report)
            }
          >
            {console.log(record.report)}
            <img src={BRAND_PENCIL} alt="Edit Report" />
          </Button>
        </AuthorizationWrapper>
      </div>
    ),
  },
];

const transformRowData = (report, openEditReportModal, handleEditReport) => ({
  key: report.report_guid,
  report,
  report_name: report.report_name,
  due_date: report.due_date,
  received_date: report.received_date,
  submission_year: report.submission_year,
  openEditReportModal,
  handleEditReport,
});

export const MineReportTable = (props) => (
  <Table
    align="left"
    pagination={false}
    columns={columns}
    locale={{ emptyText: <NullScreen type="reports" /> }}
    dataSource={props.mineReports.map((r) =>
      transformRowData(r, props.openEditReportModal, props.handleEditReport)
    )}
  />
);

MineReportTable.propTypes = propTypes;
MineReportTable.defaultProps = defaultProps;

export default MineReportTable;

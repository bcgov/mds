import React from "react";
import { Table, Menu, Dropdown, Button, Icon, Tooltip } from "antd";
import NullScreen from "@/components/common/NullScreen";
import * as Strings from "@/constants/strings";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import { orderBy } from "lodash";
import PropTypes from "prop-types";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { connect } from "react-redux";
import { BRAND_PENCIL, EDIT, EDIT_OUTLINE, CARAT } from "@/constants/assets";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import { COLOR } from "@/constants/styles";

const { errorRed } = COLOR;

/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  reports: PropTypes.arrayOf(CustomPropTypes.mineReport),
  openEditReportModal: PropTypes.func.isRequired,
};

const defaultProps = {
  reports: [
    {
      report_guid: 1,
      report_name: "Cool Report",
      due_date: "2019-07-05",
      submission_year: 2019,
    },
  ],
};

const columns = [
  {
    title: "Year",
    dataIndex: "submission_year",
    key: "submission_year",
    sorter: (a, b) => a.submission_year > b.submission_year,
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
    sorter: (a, b) => moment(a.due_date) > moment(b.due_date),
    render: (text, record) => (
      <div title="Due" style={record.isOverdue ? { color: errorRed } : {}}>
        {formatDate(record.due_date) || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "",
    dataIndex: "report",
    key: "report",
    align: "right",
    render: (text, record) => (
      <AuthorizationWrapper permission={Permission.CREATE}>
        <Button
          className="permit-table-button"
          type="ghost"
          onClick={(event) => record.openEditReportModal(event, text.report_name)}
        >
          <div>
            <img className="padding-small--right icon-svg-filter" src={EDIT_OUTLINE} alt="Edit" />
          </div>
        </Button>
      </AuthorizationWrapper>
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
    dataSource={props.reports.map((r) => transformRowData(r, props.openEditReportModal))}
  />
);

MineReportTable.propTypes = propTypes;
MineReportTable.defaultProps = defaultProps;

export default MineReportTable;

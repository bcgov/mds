import React from "react";
import { Table, Menu, Dropdown, Button, Icon, Tooltip } from "antd";
import NullScreen from "@/components/common/NullScreen";
import * as Strings from "@/constants/strings";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import { orderBy } from "lodash";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { BRAND_PENCIL, EDIT, EDIT_OUTLINE, CARAT } from "@/constants/assets";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";

/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  reports: PropTypes.arrayOf(CustomPropTypes.mineReport),
};

const defaultProps = {
  partyRelationships: [],
  permits: [],
  reports: [{ report_name: "report_name" }],
};

const columns = [
  {
    title: "Title",
    dataIndex: "report_name",
    key: "report_name",
  },
];

const transformRowData = (report) => ({
  report: report.report_name,
});

export const MineReportTable = (props) => (
  <Table
    align="left"
    pagination={false}
    columns={columns}
    locale={{ emptyText: <NullScreen type="reports" /> }}
    dataSource={props.reports.map((r) => transformRowData(r))}
  />
);

MineReportTable.propTypes = propTypes;
MineReportTable.defaultProps = defaultProps;

export default MineReportTable;

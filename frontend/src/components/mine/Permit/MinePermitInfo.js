import React from "react";
import { Table } from "antd";
import moment from "moment";
import NullScreen from "@/components/common/NullScreen";
import * as String from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
};

const columns = [
  {
    title: "Permit No.",
    // width: 150,
    dataIndex: "permitNo",
    // fixed: "left",
    key: "parentPermitNo",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    // width: 100,
  },
  {
    title: "Permittee",
    // width: 100,
    dataIndex: "permittee",
    key: "parentPermittee",
  },
  {
    title: "Authorization End Date",
    dataIndex: "authorizationEndDate",
    key: "authorizationEndDate",
    // width: 100,
  },

  {
    title: "First Issued",
    dataIndex: "firstIssued",
    key: "firstIssued",
    // width: 100,
  },
  {
    title: "Last Amended",
    dataIndex: "lastAmended",
    key: "lastAmended",
    // width: 100,
  },
];

const childColumns = [
  { title: "Permit No.", dataIndex: "permitNo", key: "permitNo" },
  { title: "Date Issued", dataIndex: "issueDate", key: "issueDate" },
  { title: "Permittee", dataIndex: "permittee", key: "permittee" },
  { title: "Description", dataIndex: "description", key: "description" },
];

// Data Manipulation
const formatDate = (dateString) => moment(dateString, "YYYY-MM-DD").format("MMM DD YYYY");

const groupPermits = (permits) =>
  permits.reduce((acc, permit) => {
    acc[permit.permit_no] = acc[permit.permit_no] || [];
    acc[permit.permit_no].push(permit);
    return acc;
  }, {});

const transformRowData = (permits) => {
  const latest = permits[0];
  const first = permits[permits.length - 1];
  return {
    key: latest.permit_guid,
    lastAmended: formatDate(latest.issue_date),
    permitNo: latest.permit_no || String.EMPTY_FIELD,
    firstIssued: formatDate(first.issue_date) || String.EMPTY_FIELD,
    permittee: latest.permittee[0] ? latest.permittee[0].party.party_name : String.EMPTY_FIELD,
    authorizationEndDate: latest.expiry_date ? latest.expiry_date : String.EMPTY_FIELD,
    amendmentHistory: permits.slice(1),
    status: String.EMPTY_FIELD,
  };
};

const transformChildRowData = (x) => ({
  key: x.permit_guid,
  permitNo: x.permit_no,
  issueDate: formatDate(x.issue_date),
  permittee: x.permittee[0] ? x.permittee[0].party.party_name : String.EMPTY_FIELD,
  description: String.EMPTY_FIELD,
});

// Components
const amendmentHistory = (record) => {
  const childRowData = record.amendmentHistory.map(transformChildRowData);
  return (
    <Table
      align="center"
      pagination={false}
      columns={childColumns}
      dataSource={childRowData}
      // scroll={{ x: 1500 }}
    />
  );
};

const permitTable = (permits) => {
  const rowData = permits.map(transformRowData);
  return (
    <Table
      className="nested-table"
      align="center"
      pagination={false}
      columns={columns}
      dataSource={rowData}
      expandedRowRender={amendmentHistory}
      // scroll={{ x: 1500 }}
      locale={{ emptyText: <NullScreen type="permit" /> }}
    />
  );
};

export const MinePermitInfo = (props) => {
  const groupedPermits = Object.values(groupPermits(props.mine.mine_permit));
  return permitTable(groupedPermits);
};

MinePermitInfo.propTypes = propTypes;

export default MinePermitInfo;

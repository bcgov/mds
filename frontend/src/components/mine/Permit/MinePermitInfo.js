import React from "react";
import { Table } from "antd";
import NullScreen from "@/components/common/NullScreen";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
};

const columns = [
  {
    title: "Permit No.",
    dataIndex: "permitNo",
    key: "permitNo",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  /*   {
    title: "Permittee",
    dataIndex: "permittee",
    key: "permittee",
  }, */
  {
    title: "Authorization End Date",
    dataIndex: "authorizationEndDate",
    key: "authorizationEndDate",
  },

  {
    title: "First Issued",
    dataIndex: "firstIssued",
    key: "firstIssued",
  },
  {
    title: "Last Amended",
    dataIndex: "lastAmended",
    key: "lastAmended",
  },
];

const childColumns = [
  { title: "Permit No.", dataIndex: "permitNo", key: "childPermitNo" },
  { title: "Date Issued", dataIndex: "issueDate", key: "issueDate" },
  // { title: "Permittee", dataIndex: "permittee", key: "childPermittee" },
  { title: "Description", dataIndex: "description", key: "description" },
];

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
    permitNo: latest.permit_no || Strings.EMPTY_FIELD,
    firstIssued: formatDate(first.issue_date) || Strings.EMPTY_FIELD,
    // permittee: latest.permittee[0] ? latest.permittee[0].party.party_name : Strings.EMPTY_FIELD,
    authorizationEndDate: latest.expiry_date ? formatDate(latest.expiry_date) : Strings.EMPTY_FIELD,
    amendmentHistory: permits.slice(1),
    status: Strings.EMPTY_FIELD,
  };
};

const transformChildRowData = ({
  permit_guid,
  permit_no,
  issue_date,
  // , permittee
}) => ({
  key: permit_guid,
  permitNo: permit_no,
  issueDate: formatDate(issue_date),
  // permittee: permittee[0] ? permittee[0].party.party_name : Strings.EMPTY_FIELD,
  description: Strings.EMPTY_FIELD,
});

const MinePermitInfo = (props) => {
  const groupedPermits = Object.values(groupPermits(props.mine.mine_permit));
  const amendmentHistory = (record) => {
    const childRowData = record.amendmentHistory.map(transformChildRowData);
    return (
      <Table align="center" pagination={false} columns={childColumns} dataSource={childRowData} />
    );
  };
  const rowData = groupedPermits.map(transformRowData);

  return (
    <Table
      className="nested-table"
      align="center"
      pagination={false}
      columns={columns}
      dataSource={rowData}
      expandedRowRender={amendmentHistory}
      locale={{ emptyText: <NullScreen type="permit" /> }}
    />
  );
};

MinePermitInfo.propTypes = propTypes;

export default MinePermitInfo;

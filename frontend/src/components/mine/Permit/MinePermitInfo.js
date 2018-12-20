import React from "react";
import { Table } from "antd";
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
    width: 150,
    dataIndex: "permitNo",
    fixed: "left",
  },
  {
    title: "Permittee",
    width: 100,
    dataIndex: "permittee",
  },
  {
    title: "Status",
    dataIndex: "status",
    width: 100,
  },
  {
    title: "First Issued",
    dataIndex: "firstIssued",
    width: 100,
  },
  {
    title: "Last Amended",
    dataIndex: "lastAmended",
    width: 100,
  },
  {
    title: "Authorization End Date",
    dataIndex: "authorizationEndDate",
    width: 100,
  },
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
    lastAmended: latest.issue_date,
    permitNo: latest.permit_no || String.EMPTY_FIELD,
    firstIssued: first.issue_date || String.EMPTY_FIELD,
    permittee: latest.permittee[0] ? latest.permittee[0].party.party_name : String.EMPTY_FIELD,
    authorizationEndDate: latest.expiry_date ? latest.expiry_date : String.EMPTY_FIELD,
    status: String.EMPTY_FIELD,
  };
};

export const MinePermitInfo = (props) => {
  const groupedPermits = Object.values(groupPermits(props.mine.mine_permit));
  const rowData = groupedPermits.map(transformRowData);
  return (
    <Table
      align="center"
      pagination={false}
      columns={columns}
      dataSource={rowData}
      scroll={{ x: 1500 }}
      locale={{ emptyText: <NullScreen type="permit" /> }}
    />
  );
};

MinePermitInfo.propTypes = propTypes;

export default MinePermitInfo;

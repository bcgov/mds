import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import NullScreen from "@/components/common/NullScreen";
import * as String from "@/constants/strings";
/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  mine: PropTypes.object.isRequired,
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

const transformRowData = (mine) =>
  mine.mine_permit[0] &&
  mine.mine_permit.map((permit) => ({
    key: permit.permit_guid,
    lastAmended: String.EMPTY_FIELD,
    permitNo: permit.permit_no ? permit.permit_no : String.EMPTY_FIELD,
    permittee: permit.permittee[0] ? permit.permittee[0].party.party_name : String.EMPTY_FIELD,
    firstIssued: permit.issue_date ? permit.issue_date : String.EMPTY_FIELD,
    status: String.EMPTY_FIELD,
    authorizationEndDate: permit.expiry_date ? permit.expiry_date : String.EMPTY_FIELD,
  }));

export const MinePermitInfo = (props) => (
  <Table
    align="center"
    pagination={false}
    columns={columns}
    dataSource={transformRowData(props.mine)}
    scroll={{ x: 1500 }}
    locale={{ emptyText: <NullScreen type="permit" /> }}
  />
);

MinePermitInfo.propTypes = propTypes;
export default MinePermitInfo;

import React from "react";
import { Table } from "antd";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";
import NullScreen from "@/components/common/NullScreen";
import { formatDate } from "@/utils/helpers";

/**
 * @class AdminVerifiedMinesList displays list of mineVerifiedStatuses for the admin page.
 */

const propTypes = {
  minesVerifiedStatusList: PropTypes.arrayOf(CustomPropTypes.mineVerificationStatus).isRequired,
};

const columns = [
  {
    title: "Mine Name",
    width: 300,
    dataIndex: "mine_name",
    render: (text, record) => (
      <div key={record.key}>
        <Link to={router.MINE_SUMMARY.dynamicRoute(record.key)}>{text}</Link>
      </div>
    ),
  },
  {
    title: "Last Verified By",
    width: 150,
    dataIndex: "verifying_user",
  },
  {
    title: "Last Verified On",
    width: 150,
    dataIndex: "formatted_timestamp",
  },
];

const transformRowData = (verifiedMinesList) =>
  verifiedMinesList.map(({ mine_guid, verifying_timestamp, ...rest }) => ({
    key: mine_guid,
    formatted_timestamp: formatDate(verifying_timestamp),
    ...rest,
  }));

export const AdminVerifiedMinesList = (props) => (
  <div>
    <Table
      align="center"
      pagination={false}
      columns={columns}
      dataSource={transformRowData(props.minesVerifiedStatusList)}
      scroll={{ y: 500 }}
      locale={{ emptyText: <NullScreen type="no-results" /> }}
    />
  </div>
);

AdminVerifiedMinesList.propTypes = propTypes;

export default AdminVerifiedMinesList;

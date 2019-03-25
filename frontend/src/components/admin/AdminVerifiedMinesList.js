import React from "react";
import { Table } from "antd";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";
import { Link } from "react-router-dom";
import NullScreen from "@/components/common/NullScreen";
import { formatDate } from "@/utils/helpers";

/**
 * @class AdminDashboard houses everything related to admin tasks, this is a permission-based route.
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
      <div key={record.mine_guid}>
        <Link to={router.MINE_SUMMARY.dynamicRoute(record.mine_guid)}>{text}</Link>
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
  verifiedMinesList.map((status) => ({
    key: status.mine_guid,
    formatted_timestamp: formatDate(status.verifying_timestamp),
    ...status,
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

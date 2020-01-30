import React from "react";
import { Table } from "antd";
import PropTypes from "prop-types";

const propTypes = {
  isLoaded: PropTypes.bool.isRequired,
};

// TODO: Ensure column order is correct and if any columns should be added or removed.
const columns = [
  { title: "Order No.", dataIndex: "order_no", key: "order_no", sorter: true },
  { title: "Violation", dataIndex: "violation", key: "violation", sorter: true },
  { title: "Report No.", dataIndex: "report_no", key: "report_no", sorter: true },
  { title: "Inspection Type", dataIndex: "inspection_type", key: "inspection_type", sorter: true },
  { title: "Inspector", dataIndex: "inspector", key: "inspector", sorter: true },
  { title: "Order Status", dataIndex: "order_status", key: "order_status", sorter: true },

  // NOTE: Brian: Can we include a tip that says "This is the date by which the violation will be rectified."?
  { title: "Due", dataIndex: "due", key: "due", sorter: true },
];

// TODO: Get inspection data.
const data = [];

export const InspectionsTable = (props) => (
  <Table
    size="small"
    pagination={false}
    loading={!props.isLoaded}
    columns={columns}
    expandedRowRender={(record) => <p style={{ margin: 0 }}>{record.description}</p>}
    dataSource={data}
    locale={{ emptyText: "This mine has no inspection data." }}
  />
);

InspectionsTable.propTypes = propTypes;

export default InspectionsTable;

import React from "react";
import { Table } from "antd";
import PropTypes from "prop-types";

const propTypes = {
  isLoaded: PropTypes.bool.isRequired,
};

const columns = [
  { title: "Permit No.", dataIndex: "permit_no", key: "permit_no", sorter: true },
  { title: "Permit Status", dataIndex: "permit_status", key: "permit_status", sorter: true },
  { title: "Permit End Date", dataIndex: "permit_end_date", key: "permit_end_date", sorter: true },
  { title: "First Issued", dataIndex: "first_issued", key: "first_issued", sorter: true },
  { title: "Last Amended", dataIndex: "last_amended", key: "last_amended", sorter: true },
];

const data = [];

export const PermitsTable = (props) => (
  <Table
    size="small"
    pagination={false}
    loading={!props.isLoaded}
    columns={columns}
    expandedRowRender={(record) => <p>{record.description}</p>}
    dataSource={data}
    locale={{ emptyText: "This mine has no permit data." }}
  />
);

PermitsTable.propTypes = propTypes;

export default PermitsTable;

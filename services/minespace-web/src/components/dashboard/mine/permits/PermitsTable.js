import React from "react";
import { Table } from "antd";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  isLoaded: PropTypes.bool.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

const columns = [
  { title: "Permit No.", dataIndex: "permit_no", key: "permit_no", sorter: true },
  { title: "Permit Status", dataIndex: "permit_status", key: "permit_status", sorter: true },
  { title: "Permit End Date", dataIndex: "permit_end_date", key: "permit_end_date", sorter: true },
  { title: "First Issued", dataIndex: "first_issued", key: "first_issued", sorter: true },
  { title: "Last Amended", dataIndex: "last_amended", key: "last_amended", sorter: true },
];

const expandedColumns = [];

const transformRowData = (permit) => {
  key: permit.permit_guid;
};

const transformExpandedRowData = (permit) => {};

export const PermitsTable = (props) => (
  <Table
    size="small"
    pagination={false}
    loading={!props.isLoaded}
    columns={columns}
    // expandedRowRender={(record) => <p>{record.description}</p>}
    dataSource={props.permits}
    locale={{ emptyText: "This mine has no permit data." }}
  />
);

PermitsTable.propTypes = propTypes;

export default PermitsTable;

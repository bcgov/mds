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

const data = [
  {
    key: "MX-ABC",
    permit_no: "MX-ABC",
    permit_status: "Open",
    permit_end_date: "December 31, 2020",
    first_issued: "April 16, 2011",
    last_amended: "February 13, 2019",
  },
  {
    key: "MX-DEF",
    permit_no: "MX-DEF",
    permit_status: "Closed",
    permit_end_date: "December 31, 2018",
    first_issued: "April 12, 2008",
    last_amended: "July 8, 2017",
  },
  {
    key: "MX-GHI",
    permit_no: "MX-GHI",
    permit_status: "Open",
    permit_end_date: "August 7, 2021",
    first_issued: "April 12, 2015",
    last_amended: "February 1, 2017",
  },
];

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

import React from "react";
import { Table } from "antd";
import PropTypes from "prop-types";

const propTypes = {
  isLoaded: PropTypes.bool.isRequired,
};

const columns = [
  { title: "Incident No.", dataIndex: "incident_no", key: "incident_no", sorter: true },
  { title: "Occurred On", dataIndex: "occured_on", key: "occured_on", sorter: true },
  { title: "Reported By", dataIndex: "reported_by", key: "reported_by", sorter: true },
  { title: "Documents", dataIndex: "documents", key: "documents", sorter: true },
];

const data = [];

export const IncidentsTable = (props) => (
  <Table
    size="small"
    pagination={false}
    loading={!props.isLoaded}
    columns={columns}
    expandedRowRender={(record) => <p style={{ margin: 0 }}>{record.description}</p>}
    dataSource={data}
    locale={{ emptyText: "This mine has no incident data." }}
  />
);

IncidentsTable.propTypes = propTypes;

export default IncidentsTable;

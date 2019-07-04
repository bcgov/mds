import React from "react";
import { Table } from "antd";
import moment from "moment";
import { RED_CLOCK } from "@/constants/assets";
import { formatDate } from "@/utils/helpers";
import { COLOR } from "@/constants/styles";
import CustomPropTypes from "@/customPropTypes";
import NullScreen from "@/components/common/NullScreen";

const propTypes = {
  filteredOrders: CustomPropTypes.complianceOrders,
};

const { errorRed } = COLOR;

const errorStyle = (isOverdue) => (isOverdue ? { color: errorRed } : {});

const defaultProps = {
  filteredOrders: [],
};

const columns = [
  {
    title: "",
    dataIndex: "overdue",
    render: (text, record) => (
      <div title="">
        {record.overdue && record.due_date !== null ? (
          <img className="padding-small" src={RED_CLOCK} alt="Overdue Report" />
        ) : (
          ""
        )}
      </div>
    ),
  },
  {
    title: "Order #",
    dataIndex: "order_no",
    render: (text, record) => (
      <div title="Order #" style={errorStyle(record.overdue)}>
        {record.order_no || "-"}
      </div>
    ),
    sorter: (a, b) => (a.order_no > b.order_no ? -1 : 1),
  },
  {
    title: "Violation",
    dataIndex: "violation",
    render: (text, record) => (
      <div title="Violation" style={errorStyle(record.overdue)}>
        {record.violation || "-"}
      </div>
    ),
    sorter: (a, b) => (a.violation > b.violation ? -1 : 1),
  },
  {
    title: "Report #",
    dataIndex: "report_no",
    render: (text, record) => (
      <div title="Report #" style={errorStyle(record.overdue)}>
        {record.report_no || "-"}
      </div>
    ),
    sorter: (a, b) => (a.report_no > b.report_no ? -1 : 1),
  },
  {
    title: "Inspector Name",
    dataIndex: "inspector",
    render: (text, record) => (
      <div title="Inspector Name" style={errorStyle(record.overdue)}>
        {record.inspector || "-"}
      </div>
    ),
    sorter: (a, b) => (a.inspector > b.inspector ? -1 : 1),
  },
  {
    title: "Order Status",
    dataIndex: "status",
    render: (text, record) => (
      <div title="Order Status" style={errorStyle(record.overdue)}>
        {record.order_status || "-"}
      </div>
    ),
    sorter: (a, b) => (a.order_status > b.order_status ? -1 : 1),
  },
  {
    title: "Due Date",
    dataIndex: "due_date",
    render: (text, record) => (
      <div title="Due Date" style={errorStyle(record.overdue)}>
        {formatDate(record.due_date) || "-"}
      </div>
    ),
    sorter: (a, b) => (moment(a.due_date) > moment(b.due_date) ? -1 : 1),
    defaultSortOrder: "descend",
  },
];

const transformRowData = (orders) =>
  orders.map((order) => ({
    key: order.order_no,
    ...order,
  }));

const defaultPageSize = 10;

const pageCount = (orders) => {
  // Number of pages required to collapse the pagination
  const maxPages = 10;

  const pages = Math.ceil(orders.length / defaultPageSize);
  return pages < maxPages ? pages : maxPages;
};

const ComplianceOrdersTable = (props) => (
  <div>
    <Table
      align="left"
      pagination
      columns={columns}
      dataSource={transformRowData(props.filteredOrders)}
      locale={{ emptyText: <NullScreen type="no-results" /> }}
      className={`center-pagination page-count-${pageCount(props.filteredOrders)}`}
    />
  </div>
);

ComplianceOrdersTable.propTypes = propTypes;
ComplianceOrdersTable.defaultProps = defaultProps;

export default ComplianceOrdersTable;

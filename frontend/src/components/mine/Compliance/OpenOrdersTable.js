/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Table, Pagination } from "antd";

import { RED_CLOCK } from "@/constants/assets";
import { formatDate } from "@/utils/helpers";
import { COLOR } from "@/constants/styles";
import NullScreen from "@/components/common/NullScreen";
import MineComplianceFilterForm from "@/components/Forms/MineComplianceFilterForm";

const propTypes = {
  handlePageChange: PropTypes.func.isRequired,
  minOrderList: PropTypes.number.isRequired,
  maxOrderList: PropTypes.number.isRequired,
  openOrders: PropTypes.arrayOf(
    PropTypes.shape({
      overdue: PropTypes.bool.isRequired,
      due_date: PropTypes.string.isRequired,
      order_no: PropTypes.string.isRequired,
      violation: PropTypes.string.isRequired,
      report_no: PropTypes.string.isRequired,
      inspector: PropTypes.string.isRequired,
    })
  ),
};

const { errorRed } = COLOR;

const errorStyle = (isOverdue) => (isOverdue ? { color: errorRed } : {});

const defaultProps = {
  openOrders: [],
};

const byDateOrOrderNo = (order1, order2) => {
  const date1 = Date.parse(order1.due_date) || 0;
  const date2 = Date.parse(order2.due_date) || 0;
  return date1 === date2 ? order1.order_no - order2.order_no : date1 - date2;
};

const filterOrders = (values) => {
  console.log(values);
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
        {record.order_no === null ? "-" : record.order_no}
      </div>
    ),
  },
  {
    title: "Violation",
    dataIndex: "violation",
    render: (text, record) => (
      <div title="Violation" style={errorStyle(record.overdue)}>
        {record.violation === null ? "-" : record.violation}
      </div>
    ),
  },
  {
    title: "Report #",
    dataIndex: "report_no",
    render: (text, record) => (
      <div title="Report #" style={errorStyle(record.overdue)}>
        {record.report_no === null ? "-" : record.report_no}
      </div>
    ),
  },
  {
    title: "Inspector Name",
    dataIndex: "inspector",
    render: (text, record) => (
      <div title="Inspector Name" style={errorStyle(record.overdue)}>
        {record.inspector === null ? "-" : record.inspector}
      </div>
    ),
  },
  {
    title: "Due Date",
    dataIndex: "due_date",
    render: (text, record) => (
      <div title="Due Date" style={errorStyle(record.overdue)}>
        {formatDate(record.due_date) || "-"}
      </div>
    ),
  },
];

const transformRowData = (orders, minOrderList, maxOrderList) =>
  orders
    .sort(byDateOrOrderNo)
    .slice(minOrderList, maxOrderList)
    .map((order) => ({
      key: order.order_no,
      ...order,
    }));

const OpenOrdersTable = (props) => (
  <div>
    <div className="compliance-filter--content">
      <h4>Filter By</h4>
      <MineComplianceFilterForm onSubmit={filterOrders} />
    </div>
    <Table
      align="left"
      pagination={false}
      columns={columns}
      dataSource={transformRowData(props.openOrders, props.minOrderList, props.maxOrderList)}
      locale={{ emptyText: <NullScreen type="no-results" /> }}
    />
    <Pagination
      defaultCurrent={1}
      defaultPageSize={10}
      onChange={props.handlePageChange}
      total={props.openOrders.length}
      className="center"
    />
  </div>
);

OpenOrdersTable.propTypes = propTypes;
OpenOrdersTable.defaultProps = defaultProps;

export default OpenOrdersTable;

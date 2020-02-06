import React, { useState } from "react";
import { Table, Button } from "antd";
import moment from "moment";
import { formatDate, compareCodes } from "@common/utils/helpers";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { RED_CLOCK } from "@/constants/assets";

const propTypes = {
  orders: CustomPropTypes.complianceOrders,
  isLoaded: PropTypes.bool.isRequired,
};

const defaultProps = {
  orders: [],
};

const columns = [
  {
    title: "",
    dataIndex: "overdue",
    render: (text, record) => (
      <div title="Overdue">
        {record.overdue && record.due_date !== null ? (
          <img className="padding-small" src={RED_CLOCK} alt="Overdue Report" />
        ) : (
          ""
        )}
      </div>
    ),
  },
  {
    title: "Order No.",
    dataIndex: "order_no",
    key: "order_no",
    render: (text, record) => <div title="Order #">{record.order_no || "-"}</div>,
    sorter: (a, b) => (a.order_no > b.order_no ? -1 : 1),
  },
  {
    title: "Violation",
    dataIndex: "violation",
    key: "violation",
    render: (text, record) => <div title="Violation">{record.violation || "-"}</div>,
    sorter: (a, b) => compareCodes(a.violation, b.violation),
  },
  {
    title: "Report No.",
    dataIndex: "report_no",
    key: "report_no",
    render: (text, record) => <div title="Report #">{record.report_no || "-"}</div>,
    sorter: (a, b) => (a.report_no > b.report_no ? -1 : 1),
  },
  {
    title: "Inspection Type",
    dataIndex: "inspection_type",
    key: "inspection_type",
    render: (text, record) => <div title="Inspector Type">{record.inspection_type || "-"}</div>,
    sorter: (a, b) => (a.inspection_type > b.inspection_type ? -1 : 1),
  },
  {
    title: "Inspector",
    dataIndex: "inspector",
    key: "inspector",
    render: (text, record) => <div title="Inspector Name">{record.inspector || "-"}</div>,
    sorter: (a, b) => (a.inspector > b.inspector ? -1 : 1),
  },
  {
    title: "Order Status",
    dataIndex: "order_status",
    key: "order_status",
    render: (text, record) => <div title="Order Status">{record.order_status || "-"}</div>,
    sorter: (a, b) => (a.order_status > b.order_status ? -1 : 1),
    defaultSortOrder: "ascend",
  },
  {
    title: "Due",
    dataIndex: "due",
    key: "due",
    render: (text, record) => <div title="Due Date">{formatDate(record.due_date) || "-"}</div>,
    sorter: (a, b) => (moment(a.due_date) > moment(b.due_date) ? -1 : 1),
    defaultSortOrder: "descend",
  },
];

const transformRowData = (orders) =>
  orders.map((order) => ({
    key: order.order_no,
    ...order,
  }));

const filterClosedOrders = (orders, display) =>
  display ? orders : orders.filter((order) => order.order_status !== "Closed");

export const InspectionsTable = (props) => {
  const [showClosedOrders, setShowClosedOrders] = useState(false);
  return (
    <div>
      <Table
        size="small"
        pagination={false}
        loading={!props.isLoaded}
        columns={columns}
        dataSource={transformRowData(filterClosedOrders(props.orders, showClosedOrders))}
        locale={{ emptyText: "This mine has no inspection data." }}
      />
      {props.isLoaded && (
        <div align="right">
          <Button
            onClick={() => setShowClosedOrders(!showClosedOrders)}
            className="full-mobile"
            type="primary"
          >
            {!showClosedOrders ? "Display Closed Orders" : "Hide Closed Orders"}
          </Button>
        </div>
      )}
    </div>
  );
};

InspectionsTable.propTypes = propTypes;
InspectionsTable.defaultProps = defaultProps;

export default InspectionsTable;

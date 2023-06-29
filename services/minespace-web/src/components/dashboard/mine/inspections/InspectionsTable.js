import React, { useState } from "react";
import { Button } from "antd";
import { compareCodes, dateSorter } from "@common/utils/helpers";
import PropTypes from "prop-types";
import { formatDate } from "@/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import { RED_CLOCK } from "@/constants/assets";
import * as STRINGS from "@/constants/strings";
import CoreTable from "@/components/common/CoreTable";

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
          <img className="padding-sm" src={RED_CLOCK} alt="Overdue Report" />
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
    render: (text, record) => <div title="Order #">{record.order_no || STRINGS.EMPTY_FIELD}</div>,
    sorter: (a, b) => (a.order_no > b.order_no ? -1 : 1),
  },
  {
    title: "Violation",
    dataIndex: "violation",
    key: "violation",
    render: (text, record) => (
      <div title="Violation">{record.violation || STRINGS.EMPTY_FIELD}</div>
    ),
    sorter: (a, b) => compareCodes(a.violation, b.violation),
  },
  {
    title: "Report No.",
    dataIndex: "report_no",
    key: "report_no",
    render: (text, record) => <div title="Report #">{record.report_no || STRINGS.EMPTY_FIELD}</div>,
    sorter: (a, b) => (a.report_no > b.report_no ? -1 : 1),
  },
  {
    title: "Inspection Type",
    dataIndex: "inspection_type",
    key: "inspection_type",
    render: (text, record) => (
      <div title="Inspector Type">{record.inspection_type || STRINGS.EMPTY_FIELD}</div>
    ),
    sorter: (a, b) => (a.inspection_type > b.inspection_type ? -1 : 1),
  },
  {
    title: "Inspector",
    dataIndex: "inspector",
    key: "inspector",
    render: (text, record) => (
      <div title="Inspector Name">{record.inspector || STRINGS.EMPTY_FIELD}</div>
    ),
    sorter: (a, b) => (a.inspector > b.inspector ? -1 : 1),
  },
  {
    title: "Order Status",
    dataIndex: "order_status",
    key: "order_status",
    render: (text, record) => (
      <div title="Order Status">{record.order_status || STRINGS.EMPTY_FIELD}</div>
    ),
    sorter: (a, b) => (a.order_status > b.order_status ? -1 : 1),
    defaultSortOrder: "ascend",
  },
  {
    title: "Due Date",
    dataIndex: "due_date",
    key: "due_date",
    render: (text, record) => (
      <div title="Due Date">{formatDate(record.due_date) || STRINGS.EMPTY_FIELD}</div>
    ),
    sorter: dateSorter("due_date"),
    defaultSortOrder: "descend",
  },
];

const filterClosedOrders = (orders, display) =>
  display ? orders : orders.filter((order) => order.order_status !== "Closed");

export const InspectionsTable = (props) => {
  const [showClosedOrders, setShowClosedOrders] = useState(false);
  return (
    <div>
      <CoreTable
        loading={!props.isLoaded}
        columns={columns}
        dataSource={filterClosedOrders(props.orders, showClosedOrders)}
        emptyText="This mine has no inspection data."
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

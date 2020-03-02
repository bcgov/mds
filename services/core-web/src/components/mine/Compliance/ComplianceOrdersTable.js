import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import { formatDate, compareCodes, formatDateTime, dateSorter } from "@common/utils/helpers";
import { downloadNRISDocument } from "@common/utils/actionlessNetworkCalls";
import { RED_CLOCK } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import NullScreen from "@/components/common/NullScreen";
import CoreTable from "@/components/common/CoreTable";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  filteredOrders: CustomPropTypes.complianceOrders,
  isLoaded: PropTypes.bool.isRequired,
};

const defaultProps = {
  filteredOrders: [],
};

const transformFileRowData = (file, inspectionId) => ({
  key: file.external_id,
  externalId: file.external_id,
  inspectionId,
  fileName: file.file_name,
  fileDate: file.document_date,
  fileType: file.document_type,
});

const fileColumns = [
  {
    title: "File Name",
    dataIndex: "fileName",
    key: "fileName",
    sorter: (a, b) => a.fileName.localeCompare(b.fileName),
    render: (text, record) => (
      <div title="File Name" key={record.externalId}>
        <LinkButton
          onClick={() =>
            downloadNRISDocument(record.externalId, record.inspectionId, record.fileName)
          }
        >
          {record.fileName}
        </LinkButton>
      </div>
    ),
  },
  {
    title: "Upload Date/Time",
    dataIndex: "fileDate",
    key: "fileDate",
    sorter: dateSorter("fileDate"),
    render: (text, record) => <div title="Upload Date/Time">{formatDateTime(record.fileDate)}</div>,
  },
  {
    title: "Type",
    dataIndex: "fileType",
    key: "fileType",
    sorter: (a, b) => a.fileType.localeCompare(b.fileType),
    render: (text, record) => <div title="Type">{record.fileType}</div>,
  },
];

const columns = [
  {
    title: "",
    key: "overdue",
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
    key: "order_no",
    dataIndex: "order_no",
    render: (text, record) => <div title="Order No.">{record.order_no || "-"}</div>,
    sorter: (a, b) => (a.order_no > b.order_no ? -1 : 1),
  },
  {
    title: "Violation",
    key: "violation",
    dataIndex: "violation",
    render: (text, record) => <div title="Violation">{record.violation || "-"}</div>,
    sorter: (a, b) => compareCodes(a.violation, b.violation),
  },
  {
    title: "Report No.",
    key: "report_no",
    dataIndex: "report_no",
    render: (text, record) => <div title="Report No.">{record.report_no || "-"}</div>,
    sorter: (a, b) => (a.report_no > b.report_no ? -1 : 1),
  },
  {
    title: "Inspector",
    key: "inspector",
    dataIndex: "inspector",
    render: (text, record) => <div title="Inspector">{record.inspector || "-"}</div>,
    sorter: (a, b) => (a.inspector > b.inspector ? -1 : 1),
  },
  {
    title: "Order Status",
    key: "status",
    dataIndex: "status",
    render: (text, record) => <div title="Order Status">{record.order_status || "-"}</div>,
    sorter: (a, b) => (a.order_status > b.order_status ? -1 : 1),
  },
  {
    title: "Due Date",
    key: "due_date",
    dataIndex: "due_date",
    render: (text, record) => <div title="Due Date">{formatDate(record.due_date) || "-"}</div>,
    sorter: dateSorter("due_date"),
    defaultSortOrder: "descend",
  },
  {
    title: "Documents",
    key: "documents",
    dataIndex: "documents",
    render: (text, record) => (
      <Table
        align="left"
        pagination={false}
        columns={fileColumns}
        dataSource={record.documents.map((file) => transformFileRowData(file, record.report_no))}
      />
    ),
  },
];

const transformRowData = (orders) =>
  orders.map((order) => ({
    key: order.order_no,
    ...order,
  }));

const pageCount = (orders) => {
  const defaultPageSize = 10;
  const maxPages = 10;
  const pages = Math.ceil(orders.length / defaultPageSize);
  return pages < maxPages ? pages : maxPages;
};

const ComplianceOrdersTable = (props) => (
  <CoreTable
    condition={props.isLoaded}
    columns={columns}
    dataSource={transformRowData(props.filteredOrders)}
    tableProps={{
      align: "left",
      pagination: true,
      locale: { emptyText: <NullScreen type="no-results" /> },
      className: `center-pagination page-count-${pageCount(props.filteredOrders)}`,
    }}
  />
);

ComplianceOrdersTable.propTypes = propTypes;
ComplianceOrdersTable.defaultProps = defaultProps;

export default ComplianceOrdersTable;

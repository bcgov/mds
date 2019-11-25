import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import moment from "moment";
import { RED_CLOCK } from "@/constants/assets";
import { formatDate, compareCodes, getTableHeaders } from "@/utils/helpers";
import { COLOR } from "@/constants/styles";
import CustomPropTypes from "@/customPropTypes";
import NullScreen from "@/components/common/NullScreen";
import TableLoadingWrapper from "@/components/common/wrappers/TableLoadingWrapper";
import LinkButton from "@/components/common/LinkButton";
import { formatDateTime } from "@/utils/helpers";
import { downloadNRISDocument } from "@/utils/actionlessNetworkCalls";

const propTypes = {
  filteredOrders: CustomPropTypes.complianceOrders,
  isLoaded: PropTypes.bool.isRequired,
};

const { errorRed } = COLOR;

const errorStyle = (isOverdue) => (isOverdue ? { color: errorRed } : {});

const defaultProps = {
  filteredOrders: [],
};

const fileColumns = [
  {
    title: "File Name",
    dataIndex: "fileName",
    key: "fileName",
    sorter: (a, b) => a.fileName.localeCompare(b.fileName),
    render: (text, record) => (
      <div title="File Name">
        <div key={record.externalId}>
          <LinkButton
            key={record.externalId}
            onClick={() =>
              downloadNRISDocument(record.externalId, record.inspectionId, record.fileName)
            }
          >
            {record.fileName}
          </LinkButton>
        </div>
      </div>
    ),
  },
  {
    title: "Upload Date/Time",
    dataIndex: "fileDate",
    key: "fileDate",
    sorter: (a, b) => (moment(a.fileDate) > moment(b.fileDate) ? -1 : 1),
    render: (text, record) => <div title="Date">{formatDateTime(record.fileDate)}</div>,
  },
  {
    title: "Type",
    dataIndex: "fileType",
    key: "fileType",
    sorter: (a, b) => a.file_name.localeCompare(b.fileType),
    render: (text, record) => <div title="Type">{record.fileType}</div>,
  },
];

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
    sorter: (a, b) => compareCodes(a.violation, b.violation),
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
  {
    title: "Documents",
    dataIndex: "documents",
    key: "documents_key",
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

const transformFileRowData = (file, inspectionId) => ({
  key: file.external_id,
  externalId: file.external_id,
  inspectionId,
  fileName: file.file_name,
  fileDate: file.document_date,
  fileType: file.document_type,
});

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
  <TableLoadingWrapper condition={props.isLoaded} tableHeaders={getTableHeaders(columns)}>
    <Table
      align="left"
      pagination
      columns={columns}
      dataSource={transformRowData(props.filteredOrders)}
      locale={{ emptyText: <NullScreen type="no-results" /> }}
      className={`center-pagination page-count-${pageCount(props.filteredOrders)}`}
    />
  </TableLoadingWrapper>
);

ComplianceOrdersTable.propTypes = propTypes;
ComplianceOrdersTable.defaultProps = defaultProps;

export default ComplianceOrdersTable;

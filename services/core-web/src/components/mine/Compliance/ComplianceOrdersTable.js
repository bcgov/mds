import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import moment from "moment";
import { formatDate, compareCodes, getTableHeaders, formatDateTime } from "@common/utils/helpers";
import { downloadNRISDocument } from "@common/utils/actionlessNetworkCalls";
import { RED_CLOCK } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import NullScreen from "@/components/common/NullScreen";
import TableLoadingWrapper from "@/components/common/wrappers/TableLoadingWrapper";
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
    sorter: (a, b) => a.fileType.localeCompare(b.fileType),
    render: (text, record) => <div title="Type">{record.fileType}</div>,
  },
];

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
    title: "Order #",
    dataIndex: "order_no",
    render: (text, record) => <div title="Order #">{record.order_no || "-"}</div>,
    sorter: (a, b) => (a.order_no > b.order_no ? -1 : 1),
  },
  {
    title: "Violation",
    dataIndex: "violation",
    render: (text, record) => <div title="Violation">{record.violation || "-"}</div>,
    sorter: (a, b) => compareCodes(a.violation, b.violation),
  },
  {
    title: "Report #",
    dataIndex: "report_no",
    render: (text, record) => <div title="Report #">{record.report_no || "-"}</div>,
    sorter: (a, b) => (a.report_no > b.report_no ? -1 : 1),
  },
  {
    title: "Inspector Name",
    dataIndex: "inspector",
    render: (text, record) => <div title="Inspector Name">{record.inspector || "-"}</div>,
    sorter: (a, b) => (a.inspector > b.inspector ? -1 : 1),
  },
  {
    title: "Order Status",
    dataIndex: "status",
    render: (text, record) => <div title="Order Status">{record.order_status || "-"}</div>,
    sorter: (a, b) => (a.order_status > b.order_status ? -1 : 1),
  },
  {
    title: "Due Date",
    dataIndex: "due_date",
    render: (text, record) => <div title="Due Date">{formatDate(record.due_date) || "-"}</div>,
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

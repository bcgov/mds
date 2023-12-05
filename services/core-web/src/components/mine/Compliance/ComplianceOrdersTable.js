import React from "react";
import PropTypes from "prop-types";
import { formatDate, compareCodes, formatDateTime, dateSorter } from "@common/utils/helpers";
import { downloadNrisDocument } from "@common/utils/actionlessNetworkCalls";
import { RED_CLOCK } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import DocumentLink from "@/components/common/DocumentLink";
import CoreTable from "@mds/common/components/common/CoreTable";
import {
  renderDateColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";

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
        <DocumentLink
          documentManagerGuid={null}
          documentName={text}
          onClickAlternative={() =>
            downloadNrisDocument(record.externalId, record.inspectionId, text)
          }
        />
      </div>
    ),
  },
  renderDateColumn("fileDate", "Upload Date/Time", true, formatDateTime),
  renderTextColumn("fileType", "Type", true),
];

const columns = [
  {
    title: "",
    key: "overdue",
    dataIndex: "overdue",
    render: (text, record) => (
      <div title="Overdue">
        {text && record.due_date !== null ? (
          <img className="padding-sm" src={RED_CLOCK} alt="Overdue Report" />
        ) : (
          ""
        )}
      </div>
    ),
  },
  renderTextColumn("order_no", "Order No.", true, "-"),
  {
    title: "Violation",
    key: "violation",
    dataIndex: "violation",
    render: (text) => <div title="Violation">{text || "-"}</div>,
    sorter: (a, b) => compareCodes(a.violation, b.violation),
  },
  renderTextColumn("report_no", "Report No.", true, "-"),
  renderTextColumn("inspector", "Inspector", true, "-"),
  renderTextColumn("order_status", "Order Status", true, "-"),
  {
    title: "Due Date",
    key: "due_date",
    dataIndex: "due_date",
    render: (text) => <div title="Due Date">{formatDate(text) || "-"}</div>,
    sorter: dateSorter("due_date"),
    defaultSortOrder: "descend",
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
    pagination={true}
    dataSource={transformRowData(props.filteredOrders)}
    className={`center-pagination page-count-${pageCount(props.filteredOrders)}`}
    expandProps={{
      getDataSource: (record) =>
        record.documents.map((file) => transformFileRowData(file, record.report_no)),
      subTableColumns: fileColumns,
      rowExpandable: (record) => record.documents.length > 0,
      recordDescription: "document details",
    }}
  />
);

ComplianceOrdersTable.propTypes = propTypes;
ComplianceOrdersTable.defaultProps = defaultProps;

export default ComplianceOrdersTable;

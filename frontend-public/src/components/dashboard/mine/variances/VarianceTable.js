import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import { RED_CLOCK } from "@/constants/assets";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import * as Strings from "@/constants/strings";
import { COLOR } from "@/constants/styles";

const { errorRed } = COLOR;

const propTypes = {
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  isApplication: PropTypes.bool,
};

const defaultProps = {
  isApplication: false,
};

const errorStyle = (isOverdue) => (isOverdue ? { color: errorRed } : {});
const transformRowData = (variances, codeHash, statusHash) =>
  variances.map((variance) => ({
    key: variance.variance_guid,
    variance,
    status: statusHash[variance.variance_application_status_code],
    compliance_article_id: codeHash[variance.compliance_article_id] || Strings.EMPTY_FIELD,
    expiry_date: formatDate(variance.expiry_date) || Strings.EMPTY_FIELD,
    issue_date: formatDate(variance.issue_date) || Strings.EMPTY_FIELD,
    note: variance.note,
    received_date: formatDate(variance.received_date) || Strings.EMPTY_FIELD,
    isOverdue: variance.expiry_date && Date.parse(variance.expiry_date) < new Date(),
    documents: variance.documents,
  }));

const columns = (isApplication) => [
  {
    title: "",
    dataIndex: "isOverdue",
    width: 10,
    render: (isOverdue) => (
      <div title="">
        {isOverdue ? <img className="padding-small" src={RED_CLOCK} alt="expired" /> : ""}
      </div>
    ),
  },
  {
    title: "Code Section",
    dataIndex: "compliance_article_id",
    render: (text, record) => (
      <div title="Code Section" style={errorStyle(record.isOverdue)}>
        {text}
      </div>
    ),
  },
  {
    title: "Submission Date",
    dataIndex: "received_date",
    className: !isApplication ? "column-hide" : "",
    render: (text) => <div title="Submission Date">{text}</div>,
    sorter: (a, b) => (a.received_date > b.received_date ? -1 : 1),
  },
  {
    title: "Application  Status",
    dataIndex: "status",
    className: !isApplication ? "column-hide" : "",
    render: (text, record) => (
      <div title="Application Status" style={errorStyle(record.isOverdue)}>
        {text}
      </div>
    ),
    sorter: (a, b) => (a.status > b.status ? -1 : 1),
  },
  {
    title: "Issue Date",
    dataIndex: "issue_date",
    className: isApplication ? "column-hide" : "",
    render: (text, record) => (
      <div title="Issue Date" style={errorStyle(record.isOverdue)}>
        {text}
      </div>
    ),
    sorter: (a, b) => ((a.issue_date || 0) > (b.issue_date || 0) ? -1 : 1),
  },
  {
    title: "Expiry Date",
    dataIndex: "expiry_date",
    className: isApplication ? "column-hide" : "",
    render: (text, record) => (
      <div title="Expiry Date" style={errorStyle(record.isOverdue)}>
        {text}
      </div>
    ),
    sorter: (a, b) => ((a.expiry_date || 0) > (b.expiry_date || 0) ? -1 : 1),
    defaultSortOrder: "descend",
  },
  {
    title: "Approval Status",
    dataIndex: "",
    className: isApplication ? "column-hide" : "",
    render: (text, record) => (
      <div title="Approval Status" style={errorStyle(record.isOverdue)}>
        {record.isOverdue ? "Expired" : "Active"}
      </div>
    ),
  },
  {
    title: "Documents",
    dataIndex: "documents",
    render: (text, record) => (
      <div title="Documents">
        {record.documents.length > 0
          ? record.documents.map((file) => (
              <div key={file.mine_document_guid}>
                <a
                  role="link"
                  key={file.mine_document_guid}
                  onClick={() => downloadFileFromDocumentManager(file.document_manager_guid)}
                  // Accessibility: Event listener
                  onKeyPress={() => downloadFileFromDocumentManager(file.document_manager_guid)}
                  // Accessibility: Focusable element
                  tabIndex="0"
                >
                  {file.document_name}
                </a>
              </div>
            ))
          : Strings.EMPTY_FIELD}
      </div>
    ),
  },
];

export const VarianceTable = (props) => (
  <div>
    <Table
      align="left"
      pagination={false}
      columns={columns(props.isApplication)}
      locale={{
        emptyText: props.isApplication
          ? "No pending variance applications"
          : "No approved variances",
      }}
      dataSource={transformRowData(
        props.variances,
        props.complianceCodesHash,
        props.varianceStatusOptionsHash
      )}
    />
  </div>
);

VarianceTable.propTypes = propTypes;
VarianceTable.defaultProps = defaultProps;

export default VarianceTable;

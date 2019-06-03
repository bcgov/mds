import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table, Button, Icon } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import { RED_CLOCK, EDIT_PENCIL } from "@/constants/assets";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import * as Strings from "@/constants/strings";
import { COLOR } from "@/constants/styles";

const { errorRed } = COLOR;

const propTypes = {
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  isApplication: PropTypes.bool,
  openEditVarianceModal: PropTypes.func,
  openViewVarianceModal: PropTypes.func,
};

const defaultProps = {
  isApplication: false,
  openEditVarianceModal: () => {},
  openViewVarianceModal: () => {},
};

export class VarianceTable extends Component {
  errorStyle = (isOverdue) => (isOverdue ? { color: errorRed } : {});

  handleConditionalEdit = (code) => code === Strings.VARIANCE_APPLICATION_CODE;

  transformRowData = (variances, codeHash, statusHash) =>
    variances.map((variance) => ({
      key: variance.variance_guid,
      variance,
      isEditable: this.handleConditionalEdit(variance.variance_application_status_code),
      status: statusHash[variance.variance_application_status_code],
      compliance_article_id: codeHash[variance.compliance_article_id] || Strings.EMPTY_FIELD,
      expiry_date: formatDate(variance.expiry_date) || Strings.EMPTY_FIELD,
      issue_date: formatDate(variance.issue_date) || Strings.EMPTY_FIELD,
      note: variance.note,
      received_date: formatDate(variance.received_date) || Strings.EMPTY_FIELD,
      isOverdue: variance.expiry_date && Date.parse(variance.expiry_date) < new Date(),
      documents: variance.documents,
    }));

  handleOpenModal = (event, isEditable, variance) => {
    event.preventDefault();
    if (isEditable) {
      this.props.openEditVarianceModal(variance);
    } else {
      this.props.openViewVarianceModal(variance);
    }
  };

  columns = (isApplication) => [
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
        <div title="Code Section" style={this.errorStyle(record.isOverdue)}>
          {text}
        </div>
      ),
    },
    {
      title: "Submission Date",
      dataIndex: "received_date",
      /*  className on the column - applies to the entire column when full size
          This attribute has no effect on the responsive view, same class is added to the div to handle responsive views
      */
      className: !isApplication ? "column-hide" : "",
      render: (text) => (
        <div className={!isApplication ? "column-hide" : ""} title="Submission Date">
          {text}
        </div>
      ),
      sorter: (a, b) => (a.received_date > b.received_date ? -1 : 1),
      defaultSortOrder: "ascend",
    },
    {
      title: "Application  Status",
      dataIndex: "status",
      className: !isApplication ? "column-hide" : "",
      render: (text, record) => (
        <div
          title="Application Status"
          className={!isApplication ? "column-hide" : ""}
          style={this.errorStyle(record.isOverdue)}
        >
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
        <div
          title="Issue Date"
          className={isApplication ? "column-hide" : ""}
          style={this.errorStyle(record.isOverdue)}
        >
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
        <div
          className={isApplication ? "column-hide" : ""}
          title="Expiry Date"
          style={this.errorStyle(record.isOverdue)}
        >
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
        <div
          className={isApplication ? "column-hide" : ""}
          title="Approval Status"
          style={this.errorStyle(record.isOverdue)}
        >
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
    {
      title: "",
      dataIndex: "variance",
      render: (text, record) => (
        <div title="" align="right">
          <Button
            type="primary"
            size="small"
            ghost
            onClick={(event) => this.handleOpenModal(event, record.isEditable, record.variance)}
          >
            {record.isEditable ? (
              <img src={EDIT_PENCIL} alt="Edit/View" className="icon-svg-filter" />
            ) : (
              <Icon type="eye" className="icon-sm" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  render() {
    return (
      <div>
        <Table
          align="left"
          pagination={false}
          columns={this.columns(this.props.isApplication)}
          locale={{
            emptyText: this.props.isApplication
              ? "No pending variance applications"
              : "No approved variances",
          }}
          dataSource={this.transformRowData(
            this.props.variances,
            this.props.complianceCodesHash,
            this.props.varianceStatusOptionsHash
          )}
        />
      </div>
    );
  }
}

VarianceTable.propTypes = propTypes;
VarianceTable.defaultProps = defaultProps;

export default VarianceTable;

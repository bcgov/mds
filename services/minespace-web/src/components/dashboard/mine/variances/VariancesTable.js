// TODO: Remove this when the file is more fully implemented.
/* eslint-disable */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table, Button, Icon } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import { RED_CLOCK, EDIT_PENCIL } from "@/constants/assets";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import * as Strings from "@/constants/strings";

const propTypes = {
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  isLoaded: PropTypes.bool.isRequired,
  isApplication: PropTypes.bool,
  openEditVarianceModal: PropTypes.func,
  openViewVarianceModal: PropTypes.func,
};

const defaultProps = {
  isApplication: false,
  openEditVarianceModal: () => {},
  openViewVarianceModal: () => {},
};

export class VariancesTable extends Component {
  getOverdueClassName = (isOverdue) => (isOverdue ? "color-error" : "");

  handleConditionalEdit = (code) => code === Strings.VARIANCE_APPLICATION_CODE;

  transformRowData = (variances, codeHash, statusHash) =>
    variances.map((variance) => ({
      key: variance.variance_guid,
      variance,
      variance_no: variance.variance_no,
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

  // NOTE: Luke/Brian: The expired "all red" styling is to be REMOVED.
  // NOTE: Luke: They've requested a lot of columns for this table... Maybe some of it
  // can be added in an "expanded" column as there might not be enough room to fit all of these
  // columns nicely on the screen. Also, the three tables (for in-review, approved, and rejected)
  // have been combined into one, so there will be some refactoring to do, of course.
  columns = (isApplication) => [
    {
      title: "",
      dataIndex: "isOverdue",
      width: 10,
      render: (text, record) => (
        <div title="Overdue">
          {record.isOverdue ? <img className="padding-small" src={RED_CLOCK} alt="expired" /> : ""}
        </div>
      ),
    },
    {
      title: "Variance No.",
      dataIndex: "variance_no",
      sorter: true,
      render: (text, record) => (
        <div className={this.getOverdueClassName(record.isOverdue)} title="Variance No.">
          {text}
        </div>
      ),
    },
    {
      title: "Code Section",
      dataIndex: "compliance_article_id",
      render: (text, record) => (
        <div className={this.getOverdueClassName(record.isOverdue)} title="Code Section">
          {text}
        </div>
      ),
    },
    {
      title: "Submitted On",
      dataIndex: "received_date",
      className: !isApplication ? "column-hide" : "",
      render: (text, record) => (
        <div
          title="Submitted On"
          className={
            (!isApplication ? "column-hide " : " ") + this.getOverdueClassName(record.isOverdue)
          }
        >
          {text}
        </div>
      ),
      sorter: (a, b) => (a.received_date > b.received_date ? -1 : 1),
      defaultSortOrder: "ascend",
    },
    {
      title: "Application Status",
      dataIndex: "status",
      className: !isApplication ? "column-hide" : "",
      render: (text, record) => (
        <div
          title="Application Status"
          className={
            (!isApplication ? "column-hide " : " ") + this.getOverdueClassName(record.isOverdue)
          }
        >
          {text}
        </div>
      ),
      sorter: (a, b) => (a.status > b.status ? -1 : 1),
    },
    {
      title: "Issue Date",
      dataIndex: "issue_date",
      render: (text, record) => <div title="Issue Date">{text}</div>,
      sorter: (a, b) => ((a.issue_date || 0) > (b.issue_date || 0) ? -1 : 1),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiry_date",
      render: (text, record) => <div title="Expiry Date">{text}</div>,
      sorter: (a, b) => ((a.expiry_date || 0) > (b.expiry_date || 0) ? -1 : 1),
      defaultSortOrder: "descend",
    },

    // NOTE: This is a newly requested column.
    {
      title: "Lead Inspector",
      dataIndex: "lead_inspector",
      render: (text, record) => <div title="Lead Inspector">{text}</div>,
    },

    // NOTE: This is a newly requested column. Brian: Remove it?
    // {
    //   title: "Lead Inspector Assigned Date",
    //   dataIndex: "lead_inspector_assigned_date",
    //   render: (text, record) => <div title="Lead Inspector Assigned Date">{text}</div>,
    // },
    {
      title: "Approval Status",
      dataIndex: "",
      render: (text, record) => (
        <div title="Approval Status">{record.isOverdue ? "Expired" : "Active"}</div>
      ),
    },

    // NOTE: This is a newly requested column. Brian: Remove it?
    // {
    //   title: "Status Last Updated",
    //   dataIndex: "",
    //   render: () => <div title="Status Last Updated">{null}</div>,
    // },
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
                    className={this.getOverdueClassName(record.isOverdue)}
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
            type="link"
            onClick={(event) => this.handleOpenModal(event, record.isEditable, record.variance)}
            className={this.getOverdueClassName(record.isOverdue)}
          >
            {record.isEditable ? (
              <img src={EDIT_PENCIL} alt="Edit/View" className="icon-svg-filter color-primary" />
            ) : (
              <Icon type="eye" className="color-primary" style={{ fontSize: "1.5em" }} />
            )}
          </Button>
        </div>
      ),
    },
  ];

  render() {
    return (
      <Table
        size="small"
        pagination={false}
        loading={!this.props.isLoaded}
        columns={this.columns(this.props.isApplication)}
        dataSource={this.transformRowData(
          this.props.variances,
          this.props.complianceCodesHash,
          this.props.varianceStatusOptionsHash
        )}
        locale={{ emptyText: "This mine has no variance data." }}
      />
    );
  }
}

VariancesTable.propTypes = propTypes;
VariancesTable.defaultProps = defaultProps;

export default VariancesTable;

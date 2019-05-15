import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table, Button, Icon } from "antd";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { RED_CLOCK, EDIT_OUTLINE } from "@/constants/assets";
import NullScreen from "@/components/common/NullScreen";
import { formatDate } from "@/utils/helpers";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import * as Strings from "@/constants/strings";
import { COLOR } from "@/constants/styles";
import LinkButton from "@/components/common/LinkButton";

const { errorRed } = COLOR;

const propTypes = {
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  openViewVarianceModal: PropTypes.func.isRequired,
  isApplication: PropTypes.bool,
  openEditVarianceModal: PropTypes.func,
};

const defaultProps = {
  openEditVarianceModal: () => {},
  isApplication: false,
};

export class MineVarianceTable extends Component {
  errorStyle = (isOverdue) => (isOverdue ? { color: errorRed } : {});

  handleOpenModal = (event, isEditable, variance) => {
    event.preventDefault();
    if (isEditable) {
      this.props.openEditVarianceModal(variance);
    } else {
      this.props.openViewVarianceModal(variance);
    }
  };

  handleConditionalEdit = (code) => code === Strings.VARIANCE_APPLICATION_CODE;

  transformRowData = (variances, codeHash, statusHash) =>
    variances.map((variance) => ({
      key: variance.variance_guid,
      variance,
      status: statusHash[variance.variance_application_status_code],
      isEditable: this.handleConditionalEdit(variance.variance_application_status_code),
      compliance_article_id: codeHash[variance.compliance_article_id] || Strings.EMPTY_FIELD,
      expiry_date:
        (variance.expiry_date && formatDate(variance.expiry_date)) || Strings.EMPTY_FIELD,
      issue_date: formatDate(variance.issue_date) || Strings.EMPTY_FIELD,
      note: variance.note,
      received_date: formatDate(variance.received_date) || Strings.EMPTY_FIELD,
      isOverdue: variance.expiry_date && Date.parse(variance.expiry_date) < new Date(),
      documents: variance.documents,
    }));

  render() {
    const columns = [
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
        className: !this.props.isApplication ? "column-hide" : "",
        render: (text) => <div title="Submission Date">{text}</div>,
        sorter: (a, b) => (a.received_date > b.received_date ? -1 : 1),
      },
      {
        title: "Application  Status",
        dataIndex: "status",
        className: !this.props.isApplication ? "column-hide" : "",
        render: (text, record) => (
          <div title="Application Status" style={this.errorStyle(record.isOverdue)}>
            {text}
          </div>
        ),
        sorter: (a, b) => (a.status > b.status ? -1 : 1),
      },
      {
        title: "Issue Date",
        dataIndex: "issue_date",
        className: this.props.isApplication ? "column-hide" : "",
        render: (text, record) => (
          <div title="Issue Date" style={this.errorStyle(record.isOverdue)}>
            {text}
          </div>
        ),
        sorter: (a, b) => (a.issue_date > b.issue_date ? -1 : 1),
      },
      {
        title: "Expiry Date",
        dataIndex: "expiry_date",
        className: this.props.isApplication ? "column-hide" : "",
        render: (text, record) => (
          <div title="Expiry Date" style={this.errorStyle(record.isOverdue)}>
            {text}
          </div>
        ),
        sorter: (a, b) => ((a.expiry_date || 0) > (b.expiry_date || 0) ? -1 : 1),
        defaultSortOrder: "descend",
      },
      {
        title: "Approval Status",
        dataIndex: "status",
        className: this.props.isApplication ? "column-hide" : "",
        render: (text, record) => (
          <div title="Approval Status" style={this.errorStyle(record.isOverdue)}>
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
                    <LinkButton
                      key={file.mine_document_guid}
                      onClick={() => downloadFileFromDocumentManager(file.document_manager_guid)}
                    >
                      {file.document_name}
                    </LinkButton>
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
            <AuthorizationWrapper permission={Permission.CREATE}>
              <Button
                type="primary"
                size="small"
                ghost
                onClick={(event) =>
                  this.handleOpenModal(event, record.isEditable, record.variance, record.isOverdue)
                }
              >
                {record.isEditable ? (
                  <img src={EDIT_OUTLINE} alt="Edit/View" className="icon-svg-filter" />
                ) : (
                  <Icon type="eye" className="icon-sm" />
                )}
              </Button>
            </AuthorizationWrapper>
          </div>
        ),
      },
    ];

    return (
      <div>
        <Table
          align="left"
          pagination={false}
          columns={columns}
          locale={{
            emptyText: (
              <NullScreen
                type={this.props.isApplication ? "variance-applications" : "approved-variances"}
              />
            ),
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

MineVarianceTable.propTypes = propTypes;
MineVarianceTable.defaultProps = defaultProps;

export default MineVarianceTable;

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import { truncateFilename, dateSorter } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import { RED_CLOCK } from "@/constants/assets";
import * as Strings from "@/constants/strings";
import LinkButton from "@/components/common/LinkButton";
import CoreTable from "@mds/common/components/common/CoreTable";

const propTypes = {
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  isLoaded: PropTypes.bool.isRequired,
  openEditVarianceModal: PropTypes.func,
  openViewVarianceModal: PropTypes.func,
  inspectorsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  openEditVarianceModal: () => {},
  openViewVarianceModal: () => {},
};

export class VariancesTable extends Component {
  getOverdueClassName = (isOverdue) => (isOverdue ? "color-error" : "");

  getApprovalStatus = (expiry) => {
    if (expiry) {
      return expiry && Date.parse(expiry) < new Date() ? "Expired" : "Active";
    }
    return Strings.EMPTY_FIELD;
  };

  transformRowData = (variances, codeHash, statusHash) =>
    variances &&
    variances.map((variance) => ({
      key: variance.variance_guid,
      variance,
      variance_no: variance.variance_no,
      lead_inspector:
        this.props.inspectorsHash[variance.inspector_party_guid] || Strings.EMPTY_FIELD,
      status: statusHash[variance.variance_application_status_code],
      compliance_article_id: codeHash[variance.compliance_article_id] || Strings.EMPTY_FIELD,
      expiry_date: formatDate(variance.expiry_date) || Strings.EMPTY_FIELD,
      issue_date: formatDate(variance.issue_date) || Strings.EMPTY_FIELD,
      note: variance.note,
      received_date: formatDate(variance.received_date) || Strings.EMPTY_FIELD,
      isOverdue: variance.expiry_date && Date.parse(variance.expiry_date) < new Date(),
      approval_status: this.getApprovalStatus(variance.expiry_date),
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

  columns = () => [
    {
      title: "",
      dataIndex: "isOverdue",
      width: 10,
      render: (text, record) => (
        <div title="Overdue">
          {record.isOverdue ? <img className="padding-sm" src={RED_CLOCK} alt="expired" /> : ""}
        </div>
      ),
    },
    {
      title: "Variance No.",
      dataIndex: "variance_no",
      sorter: (a, b) => (a.variance_no > b.variance_no ? -1 : 1),
      render: (text) => <div title="Variance No.">{text}</div>,
    },
    {
      title: "Code Section",
      dataIndex: "compliance_article_id",
      render: (text) => <div title="Code Section">{text}</div>,
    },
    {
      title: "Submitted On",
      dataIndex: "received_date",
      render: (text) => <div title="Submitted On">{text}</div>,
      sorter: dateSorter("received_date"),
    },
    {
      title: "Application Status",
      dataIndex: "status",
      render: (text) => <div title="Application Status">{text}</div>,
      sorter: (a, b) => (a.status > b.status ? -1 : 1),
    },
    {
      title: "Issue Date",
      dataIndex: "issue_date",
      render: (text) => <div title="Issue Date">{text}</div>,
      sorter: dateSorter("issue_date"),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiry_date",
      render: (text) => <div title="Expiry Date">{text}</div>,
      sorter: dateSorter("expiry_date"),
    },
    {
      title: "Inspector",
      dataIndex: "lead_inspector",
      sorter: (a, b) => (a.lead_inspector > b.lead_inspector ? -1 : 1),
      render: (text) => <div title="Lead Inspector">{text}</div>,
    },
    {
      title: "Approval Status",
      dataIndex: "approval_status",
      sorter: (a, b) => (a.approval_status > b.approval_status ? -1 : 1),
      defaultSortOrder: "descend",
      render: (text) => <div title="Approval Status">{text}</div>,
    },
    {
      title: "Documents",
      dataIndex: "documents",
      render: (text, record) => {
        return (
          <div title="Documents" className="cap-col-height">
            {record.documents.length > 0
              ? record.documents.map((file) => (
                  <div key={file.mine_document_guid}>
                    <LinkButton title={text} onClick={() => downloadFileFromDocumentManager(file)}>
                      {truncateFilename(file.document_name)}
                    </LinkButton>
                  </div>
                ))
              : Strings.EMPTY_FIELD}
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "variance",
      render: (text, record) => (
        <div title="" align="right">
          <Button
            type="primary"
            size="small"
            onClick={(event) => this.handleOpenModal(event, record.isEditable, record.variance)}
          >
            Details
          </Button>
        </div>
      ),
    },
  ];

  render() {
    return (
      <CoreTable
        loading={!this.props.isLoaded}
        columns={this.columns()}
        dataSource={this.transformRowData(
          this.props.variances,
          this.props.complianceCodesHash,
          this.props.varianceStatusOptionsHash
        )}
        emptyText="This mine has no variance data."
      />
    );
  }
}

VariancesTable.propTypes = propTypes;
VariancesTable.defaultProps = defaultProps;

export default VariancesTable;

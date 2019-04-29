/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table, Button } from "antd";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { RED_CLOCK, BRAND_PENCIL } from "@/constants/assets";
import NullScreen from "@/components/common/NullScreen";
import { formatDate } from "@/utils/helpers";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import * as String from "@/constants/strings";
import { COLOR } from "@/constants/styles";

const { errorRed } = COLOR;

const propTypes = {
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  openViewVarianceModal: PropTypes.func.isRequired,
};

export class MineVarianceTable extends Component {
  errorStyle = (isOverdue) => (isOverdue ? { color: errorRed } : {});

  sortByDateOrID = (variance1, variance2) => {
    const date1 = Date.parse(variance1.expiry_date) || 0;
    const date2 = Date.parse(variance2.expiry_date) || 0;
    return date1 === date2 ? variance1.variance_id - variance2.variance_id : date1 - date2;
  };

  transformRowData = (variances, codeHash) =>
    variances.sort(this.sortByDateOrID).map((variance) => {
      console.log(variance);
      return {
        key: variance.variance_id,
        editVariance: variances[variance.variance_id],
        compliance_article_id: codeHash[variance.compliance_article_id] || String.EMPTY_FIELD,
        expiry_date: formatDate(variance.expiry_date) || String.EMPTY_FIELD,
        issue_date: formatDate(variance.issue_date) || String.EMPTY_FIELD,
        note: variance.note,
        received_date: formatDate(variance.received_date) || String.EMPTY_FIELD,
        isOverdue: Date.parse(variance.expiry_date) < new Date(),
        documents: variance.documents,
      };
    });

  render() {
    const columns = [
      {
        title: "",
        dataIndex: "expired",
        width: 10,
        render: (text, record) => (
          <div title="">
            {record.isOverdue ? (
              <img className="padding-small" src={RED_CLOCK} alt="expired" />
            ) : (
              ""
            )}
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
        title: "Issue Date",
        dataIndex: "issue_date",
        render: (text, record) => (
          <div title="Issue Date" style={this.errorStyle(record.isOverdue)}>
            {text}
          </div>
        ),
      },
      {
        title: "Expiry Date",
        dataIndex: "expiry_date",
        render: (text, record) => (
          <div title="Expiry Date" style={this.errorStyle(record.isOverdue)}>
            {text}
          </div>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        render: (text, record) => (
          <div title="Status" style={this.errorStyle(record.isOverdue)}>
            {record.isOverdue ? "Expired" : "Active"}
          </div>
        ),
      },
      {
        title: "Documents",
        dataIndex: "documents",
        render: (text, record) => (
          <div title="Documents">
            {record.documents
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
              : "-"}
          </div>
        ),
      },
      {
        title: "",
        dataIndex: "editVariance",
        render: (text, record) => (
          <div title="" align="right">
            <AuthorizationWrapper permission={Permission.CREATE}>
              <Button
                type="primary"
                size="small"
                ghost
                onClick={(event, text) => this.props.openViewVarianceModal(event, record.variance)}
              >
                <img src={BRAND_PENCIL} alt="Edit/View" />
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
          locale={{ emptyText: <NullScreen type="variance" /> }}
          dataSource={this.transformRowData(this.props.variances, this.props.complianceCodesHash)}
        />
      </div>
    );
  }
}

MineVarianceTable.propTypes = propTypes;

export default MineVarianceTable;

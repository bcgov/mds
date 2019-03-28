import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { RED_CLOCK } from "@/constants/assets";
import NullScreen from "@/components/common/NullScreen";
import { formatDate } from "@/utils/helpers";
import * as String from "@/constants/strings";
import { COLOR } from "@/constants/styles";

const { errorRed } = COLOR;

const propTypes = {
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class MineVarianceTable extends Component {
  errorStyle = (isOverdue) => (isOverdue ? { color: errorRed } : {});

  sortByDateOrID = (variance1, variance2) => {
    const date1 = Date.parse(variance1.expiry_date) || 0;
    const date2 = Date.parse(variance2.expiry_date) || 0;
    return date1 === date2 ? variance1.variance_id - variance2.variance_id : date1 - date2;
  };

  transformRowData = (variances, codeHash) =>
    variances.sort(this.sortByDateOrID).map((variance) => ({
      key: variance.variance_id,
      compliance_article_id: codeHash[variance.compliance_article_id] || String.EMPTY_FIELD,
      expiry_date: formatDate(variance.expiry_date) || String.EMPTY_FIELD,
      issue_date: formatDate(variance.issue_date) || String.EMPTY_FIELD,
      note: variance.note,
      received_date: formatDate(variance.received_date) || String.EMPTY_FIELD,
      isOverdue: Date.parse(variance.expiry_date) < new Date(),
    }));

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
          <div title="Documents" style={this.errorStyle(record.isOverdue)}>
            {text}
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

/* eslint-disable  */
import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@/constants/strings";
import { RED_CLOCK } from "@/constants/assets";
import NullScreen from "@/components/common/NullScreen";
import { formatDate } from "@/utils/helpers";
import * as String from "@/constants/strings";
import { COLOR } from "@/constants/styles";

const { errorRed } = COLOR;

const propTypes = {};

const errorStyle = (isOverdue) => (isOverdue ? { color: errorRed } : {});

const columns = [
  {
    title: "",
    dataIndex: "expired",
    width: 10,
    render: (text, record) => (
      <div title="">
        {record.isOverdue ? <img className="padding-small" src={RED_CLOCK} alt="expired" /> : ""}
      </div>
    ),
  },
  {
    title: "Code",
    dataIndex: "compliance_article_id",
    render: (text, record) => (
      <div title="Code" style={errorStyle(record.isOverdue)}>
        {text}
      </div>
    ),
  },
  {
    title: "Issue Date",
    dataIndex: "issue_date",
    render: (text, record) => (
      <div title="Issue Date" style={errorStyle(record.isOverdue)}>
        {text}
      </div>
    ),
  },
  {
    title: "Expiry Date",
    dataIndex: "expiry_date",
    render: (text, record) => (
      <div title="Expiry Date" style={errorStyle(record.isOverdue)}>
        {text}
      </div>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (text, record) => (
      <div title="Status" style={errorStyle(record.isOverdue)}>
        {record.isOverdue ? "Expired" : "Aciive"}
      </div>
    ),
  },
  {
    title: "Documents",
    dataIndex: "documents",
    render: (text, record) => (
      <div title="Documents" style={errorStyle(record.isOverdue)}>
        {text}
      </div>
    ),
  },
];

const transformRowData = (variances) =>
  variances.map((variance) => ({
    key: variance.variance_id,
    compliance_article_id: variance.compliance_article_id || String.EMPTY_FIELD,
    expiry_date: formatDate(variance.expiry_date) || String.EMPTY_FIELD,
    issue_date: formatDate(variance.issue_date) || String.EMPTY_FIELD,
    note: variance.note,
    received_date: formatDate(variance.received_date) || String.EMPTY_FIELD,
    isOverdue: Date.parse(variance.expiry_date) < new Date(),
  }));

const MineVarianceTable = (props) => {
  console.log(props);
  return (
    <div>
      <Table
        align="left"
        pagination={false}
        columns={columns}
        locale={{ emptyText: <NullScreen type="variance" /> }}
        dataSource={transformRowData(props.variances.data)}
      />
    </div>
  );
};

MineVarianceTable.propTypes = propTypes;

export default MineVarianceTable;

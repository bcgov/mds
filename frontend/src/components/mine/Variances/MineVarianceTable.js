/* eslint-disable  */
import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import CustomPropTypes from "@/customPropTypes";
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
        {record.expired ? <img className="padding-small" src={RED_CLOCK} alt="expired" /> : ""}
      </div>
    ),
  },
  {
    title: "Variance No",
    dataIndex: "varianceNo",
    render: (text, record) => (
      <div title="Variance No" style={errorStyle(record.isOverdue)}>
        {record.doc.exp_document_name}
      </div>
    ),
  },
  {
    title: "Code",
    dataIndex: "code",
    render: (text, record) => (
      <div title="Code" style={errorStyle(record.isOverdue)}>
        {record.doc.hsrc_code}
      </div>
    ),
  },
  {
    title: "Issue Date",
    dataIndex: "issuedate",
    render: (text, record) => (
      <div title="Issue Date" style={errorStyle(record.isOverdue)}>
        {formatDate(record.doc.due_date) || "-"}
      </div>
    ),
  },
  {
    title: "Expiry Date",
    dataIndex: "receivedDate",
    render: (text, record) => (
      <div title="Expiry Date" style={errorStyle(record.isOverdue)}>
        {" "}
        {formatDate(record.doc.received_date) || "-"}
      </div>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (text, record) => (
      <div title="Status" style={errorStyle(record.isOverdue)}>
        {record.doc ? record.doc.exp_document_status.description : String.LOADING}
      </div>
    ),
  },
  {
    title: "Documents",
    dataIndex: "documents",
    render: (text, record) => (
      <div title="Documents" style={errorStyle(record.isOverdue)}>
        {record.doc ? record.doc.exp_document_status.description : String.LOADING}
      </div>
    ),
  },
];

const MineVarianceTable = (props) => (
  <div className="mine-info-padding">
    <Table
      align="left"
      pagination={false}
      columns={columns}
      locale={{ emptyText: <NullScreen type="variance" /> }}
      // dataSource={}
    />
  </div>
);

MineVarianceTable.propTypes = propTypes;

export default MineVarianceTable;

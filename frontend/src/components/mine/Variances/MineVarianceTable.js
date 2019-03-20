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
    title: "Name",
    dataIndex: "name",
    render: (text, record) => (
      <div title="Name" style={errorStyle(record.isOverdue)}>
        {record.doc.exp_document_name}
      </div>
    ),
  },
  {
    title: "HSRC Code",
    dataIndex: "hsrc_code",
    render: (text, record) => (
      <div title="Name" style={errorStyle(record.isOverdue)}>
        {record.doc.hsrc_code}
      </div>
    ),
  },
  {
    title: "Due",
    dataIndex: "due",
    render: (text, record) => (
      <div title="Due" style={errorStyle(record.isOverdue)}>
        {formatDate(record.doc.due_date) || "-"}
      </div>
    ),
  },
  {
    title: "Received",
    dataIndex: "received",
    render: (text, record) => (
      <div title="Received" style={errorStyle(record.isOverdue)}>
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
];

const MineVarianceTable = (props) => (
  <div className="mine-info-padding">
    <Table
      align="left"
      pagination={false}
      columns={columns}
      locale={{ emptyText: <NullScreen type="permit" /> }}
      // dataSource={}
    />
  </div>
);

MineVarianceTable.propTypes = propTypes;

export default MineVarianceTable;

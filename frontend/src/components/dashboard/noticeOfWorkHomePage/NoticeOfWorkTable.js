import React from "react";
import { Table } from "antd";
import NullScreen from "@/components/common/NullScreen";

/**
 * @class NoticeOfWorkTable - paginated list of notice of work applications
 */

const columns = [
  {
    title: "Region",
    dataIndex: "region",
    render: (text) => <div title="Region">{text}</div>,
  },
  {
    title: "NoW No.",
    dataIndex: "nowNum",
    render: (text) => <div title="NoW No.">{text}</div>,
  },
  {
    title: "Mine",
    dataIndex: "mine",
    render: (text) => <div title="Mine">{text}</div>,
  },
  {
    title: "Permit No.",
    dataIndex: "permitNo",
    render: (text) => <div title="Permit No.">{text}</div>,
  },
  {
    title: "NoW Mine Type",
    dataIndex: "mineType",
    render: (text) => <div title="NoW Mine Type">{text}</div>,
  },
  {
    title: "Application Status",
    dataIndex: "status",
    render: (text) => <div title="Application Status">{text}</div>,
  },
  {
    title: "Import Date",
    dataIndex: "dare",
    render: (text) => <div title="Import Date">{text}</div>,
  },
];

export const NoticeOfWorkTable = () => (
  <Table
    align="left"
    pagination={false}
    columns={columns}
    dataSource={[]}
    locale={{ emptyText: <NullScreen type="no-results" /> }}
  />
);

export default NoticeOfWorkTable;

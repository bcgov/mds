import React from "react";
import { Button, Table } from "antd";

const columns = [
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
    sorter: (a, b) => (a.title > b.title ? -1 : 1),
  },
  {
    title: "NOD #",
    dataIndex: "nodNumber",
    key: "nodNumber",
    sorter: (a, b) => (a.nodNumber > b.nodNumber ? -1 : 1),
  },
  {
    title: "Permit #",
    dataIndex: "permitNumber",
    key: "permitNumber",
    sorter: (a, b) => (a.permitNumber > b.permitNumber ? -1 : 1),
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    sorter: (a, b) => (a.type > b.type ? -1 : 1),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    sorter: (a, b) => (a.status > b.status ? -1 : 1),
    defaultSortOrder: "ascend",
  },
  {
    render: () => (
      <Button
        type="primary"
        size="small"
        onClick={() => {
          // TODO: Create/Integrate Modal
        }}
      >
        View
      </Button>
    ),
  },
];

const NoticeOfDepartureTable = () => {
  // TODO: replace test data with real data
  const testRowData = [
    {
      key: 1,
      title: "Test Title",
      nodNumber: "Test NOD #",
      permitNumber: "Test Permit #",
      type: "Test Type",
      status: "Test Status",
    },
  ];
  return (
    <Table
      columns={columns}
      dataSource={testRowData}
      pagination={false}
      rowKey={(record) => record.key}
    />
  );
};

export default NoticeOfDepartureTable;

import React from "react";
import { Button, Table } from "antd";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";

const columns = [
  {
    title: "Title",
    dataIndex: "nod_title",
    key: "nod_title",
    sorter: (a, b) => (a.nod_title > b.nod_title ? -1 : 1),
  },
  {
    title: "NOD #",
    dataIndex: "nod_guid",
    key: "nod_guid",
    sorter: (a, b) => (a.nod_guid > b.nod_guid ? -1 : 1),
  },
  {
    title: "Permit #",
    dataIndex: ["permit", "permit_no"],
    key: ["permit", "permit_no"],
    sorter: (a, b) => (a.permit.permit_no > b.permit.permit_no ? -1 : 1),
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

const propTypes = {
  data: PropTypes.arrayOf(CustomPropTypes.noticeOfDeparture).isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

const NoticeOfDepartureTable = (props) => {
  return (
    <Table
      loading={!props.isLoaded}
      columns={columns}
      dataSource={props.data}
      pagination={false}
      rowKey={(record) => record.key}
    />
  );
};

NoticeOfDepartureTable.propTypes = propTypes;

export default NoticeOfDepartureTable;

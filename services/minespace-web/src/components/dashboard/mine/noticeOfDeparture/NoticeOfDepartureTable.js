import React from "react";
import { Button, Row, Table } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { TrashCanIcon } from "@/assets/icons";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  data: PropTypes.arrayOf(CustomPropTypes.noticeOfDeparture).isRequired,
  openViewNoticeOfDepartureModal: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

const NoticeOfDepartureTable = (props) => {
  const handleOpenModal = (event, noticeOfDeparture) => {
    event.preventDefault();
    props.openViewNoticeOfDepartureModal(noticeOfDeparture);
  };

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
      title: "Submitted",
      dataIndex: "created_at",
      key: "created_at",
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
      render: (text, record) => (
        <div title="" align="right">
          <Row>
            <Button type="primary" size="small" ghost>
              <EyeOutlined
                onClick={(event) => handleOpenModal(event, record)}
                className="icon-xs--darkestgrey"
              />
            </Button>
            <Button type="primary" size="small" ghost>
              <TrashCanIcon onClick={() => {}} className="icon-xs--darkestgrey" />
            </Button>
          </Row>
        </div>
      ),
    },
  ];

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

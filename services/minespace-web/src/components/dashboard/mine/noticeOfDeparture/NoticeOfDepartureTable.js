import React from "react";
import { Button, Row, Table } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import {
  EMPTY_FIELD,
  NOTICE_OF_DEPARTURE_STATUS,
  NOTICE_OF_DEPARTURE_TYPE,
} from "@/constants/strings";
import { formatDate } from "@/utils/helpers";

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
      dataIndex: "nod_id",
      key: "nod_id",
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
      dataIndex: "submitted_at",
      key: "submitted_at",
      sorter: (a, b) => (a.permit.permit_no > b.permit.permit_no ? -1 : 1),
    },
    {
      title: "Type",
      dataIndex: "nod_type",
      key: "nod_type",
      sorter: (a, b) => (a.type > b.type ? -1 : 1),
    },
    {
      title: "Status",
      dataIndex: "nod_status",
      key: "nod_status",
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
          </Row>
        </div>
      ),
    },
  ];

  const transformRowData = (nods) =>
    nods.map(
      ({
        submission_timestamp,
        create_timestamp,
        update_timestamp,
        nod_guid,
        nod_type,
        nod_status,
        ...other
      }) => ({
        ...other,
        key: nod_guid,
        nod_id: nod_guid,
        nod_status: NOTICE_OF_DEPARTURE_STATUS[nod_status] || EMPTY_FIELD,
        nod_type: NOTICE_OF_DEPARTURE_TYPE[nod_type] || EMPTY_FIELD,
        updated_at: formatDate(update_timestamp),
        submitted_at: formatDate(submission_timestamp) || formatDate(create_timestamp),
      })
    );

  return (
    <Table
      loading={!props.isLoaded}
      columns={columns}
      dataSource={transformRowData(props.data)}
      pagination={false}
      rowKey={(record) => record.key}
    />
  );
};

NoticeOfDepartureTable.propTypes = propTypes;

export default NoticeOfDepartureTable;

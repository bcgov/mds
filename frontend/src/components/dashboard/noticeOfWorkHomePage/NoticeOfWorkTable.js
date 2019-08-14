import React from "react";
import { Table } from "antd";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import * as Strings from "@/constants/strings";
import * as router from "@/constants/routes";
import NullScreen from "@/components/common/NullScreen";

/**
 * @class NoticeOfWorkTable - paginated list of notice of work applications
 */
const propTypes = {
  // use NoW custom prop once this feature is fully implemented
  // eslint-disable-next-line react/forbid-prop-types
  noticeOfWorkApplications: PropTypes.array,
};

const defaultProps = {
  noticeOfWorkApplications: [],
};

const columns = [
  {
    title: "Region",
    dataIndex: "region",
    render: (text) => <div title="Region">{text}</div>,
  },
  {
    title: "NoW No.",
    dataIndex: "nowNum",
    render: (text, record) => (
      <Link to={router.NOTICE_OF_WORK_APPLICATION.dynamicRoute(record.key)}>{text}</Link>
    ),
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
    dataIndex: "date",
    render: (text) => <div title="Import Date">{text}</div>,
  },
];

const transformRowData = (applications) =>
  applications.map((application) => ({
    key: application.application_guid,
    region: Strings.EMPTY_FIELD,
    nowNum: Strings.EMPTY_FIELD,
    mine: Strings.EMPTY_FIELD,
    permitNo: Strings.EMPTY_FIELD,
    mineType: Strings.EMPTY_FIELD,
    status: Strings.EMPTY_FIELD,
    date: Strings.EMPTY_FIELD,
  }));

export const NoticeOfWorkTable = (props) => (
  <Table
    align="left"
    pagination={false}
    columns={columns}
    dataSource={transformRowData(props.noticeOfWorkApplications)}
    locale={{ emptyText: <NullScreen type="no-results" /> }}
  />
);

NoticeOfWorkTable.propTypes = propTypes;
NoticeOfWorkTable.defaultProps = defaultProps;

export default NoticeOfWorkTable;

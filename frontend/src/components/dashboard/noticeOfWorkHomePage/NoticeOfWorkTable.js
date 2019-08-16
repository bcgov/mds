import React from "react";
import { Table } from "antd";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import * as Strings from "@/constants/strings";
import * as router from "@/constants/routes";
import NullScreen from "@/components/common/NullScreen";

import { formatDate } from "@/utils/helpers";

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
    dataIndex: "mineName",
    render: (text, record) =>
      record.mineGuid ? (
        <Link to={router.NOTICE_OF_WORK_APPLICATION.dynamicRoute(record.mineGuid)}>{text}</Link>
      ) : (
        <div title="Mine">{text}</div>
      ),
  },
  {
    title: "NoW Type",
    dataIndex: "nowType",
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
    region: Strings.EMPTY_FIELD, // TODO: Figure out what Region is and add it here
    nowNum: application.trackingnumber || Strings.EMPTY_FIELD,
    mineGuid: application.mine_guid || Strings.EMPTY_FIELD,
    mineName: application.mine_name || Strings.EMPTY_FIELD,
    nowType: application.noticeofworktype || Strings.EMPTY_FIELD,
    status: application.status || Strings.EMPTY_FIELD,
    date: formatDate(application.receiveddate) || Strings.EMPTY_FIELD,
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

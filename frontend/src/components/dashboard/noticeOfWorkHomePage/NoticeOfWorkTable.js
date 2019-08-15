import React from "react";
import { Table, Icon, Input, Button } from "antd";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { isEmpty } from "lodash";
import * as Strings from "@/constants/strings";
import * as router from "@/constants/routes";
import NullScreen from "@/components/common/NullScreen";

import { formatDate } from "@/utils/helpers";

/**
 * @class NoticeOfWorkTable - paginated list of notice of work applications
 */
const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  // use NoW custom prop once this feature is fully implemented
  // eslint-disable-next-line react/forbid-prop-types
  noticeOfWorkApplications: PropTypes.array,
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
};

const defaultProps = {
  sortField: null,
  sortDir: null,
  noticeOfWorkApplications: [],
};

const filterComponent = (handleSearch, name) => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
    let searchInput;
    return (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            searchInput = node && node.props.value;
          }}
          placeholder={`Search ${name}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => {
            handleSearch({ trackingnumber: searchInput });
          }}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => {
            handleSearch({ trackingnumber: searchInput });
          }}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => {
            handleSearch({ trackingnumber: null });
          }}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    );
  },
  filterIcon: (filtered) => (
    <Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
  ),
});

const columns = (handleSearch) => [
  {
    title: "Region",
    dataIndex: "region",
    // sortField: "region" TODO: Figure out what Region is and add it here
    render: (text) => <div title="Region">{text}</div>,
  },
  {
    title: "NoW No.",
    dataIndex: "nowNum",
    sortField: "trackingnumber",
    render: (text, record) => (
      <Link to={router.NOTICE_OF_WORK_APPLICATION.dynamicRoute(record.key)}>{text}</Link>
    ),
    sorter: true,
    ...filterComponent(handleSearch, "NoW No."),
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
    sortField: "noticeofworktype",
    render: (text) => <div title="NoW Mine Type">{text}</div>,
    sorter: true,
  },
  {
    title: "Application Status",
    dataIndex: "status",
    sortField: "status",
    render: (text) => <div title="Application Status">{text}</div>,
    sorter: true,
  },
  {
    title: "Import Date",
    dataIndex: "date",
    sortField: "receiveddate",
    render: (text) => <div title="Import Date">{text}</div>,
    sorter: true,
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

const handleTableChange = (updateApplicationList) => (pagination, filters, sorter) => {
  const params = isEmpty(sorter)
    ? {
        sort_field: undefined,
        sort_dir: undefined,
      }
    : {
        sort_field: sorter.column.sortField,
        sort_dir: sorter.order.replace("end", ""),
      };
  updateApplicationList(params);
};

const applySortIndicator = (_columns, field, dir) =>
  _columns.map((column) => ({
    ...column,
    sortOrder: column.sortField === field ? dir.concat("end") : false,
  }));

export const NoticeOfWorkTable = (props) => (
  <Table
    align="left"
    pagination={false}
    columns={applySortIndicator(columns(props.handleSearch), props.sortField, props.sortDir)}
    dataSource={transformRowData(props.noticeOfWorkApplications)}
    locale={{ emptyText: <NullScreen type="no-results" /> }}
    onChange={handleTableChange(props.handleSearch)}
  />
);

NoticeOfWorkTable.propTypes = propTypes;
NoticeOfWorkTable.defaultProps = defaultProps;

export default NoticeOfWorkTable;

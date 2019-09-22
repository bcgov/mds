import React, { Component } from "react";
import { Table, Icon, Input, Button } from "antd";
import { Link } from "react-router-dom";
import { isEmpty } from "lodash";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@/constants/strings";
import * as router from "@/constants/routes";
import NullScreen from "@/components/common/NullScreen";

import { formatDate, optionsFilterAdapter } from "@/utils/helpers";

/**
 * @class NoticeOfWorkTable - paginated list of notice of work applications
 */
const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  noticeOfWorkApplications: PropTypes.arrayOf(CustomPropTypes.nowApplication),
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
  searchParams: PropTypes.shape({ mine_region: PropTypes.arrayOf(PropTypes.string) }),
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineRegionOptions: CustomPropTypes.options.isRequired,
};

const defaultProps = {
  sortField: null,
  sortDir: null,
  noticeOfWorkApplications: [],
  searchParams: {},
};

const handleTableChange = (updateApplicationList) => (pagination, { mine_region } = {}, sorter) => {
  const sortParams = isEmpty(sorter)
    ? {
        sort_field: undefined,
        sort_dir: undefined,
      }
    : {
        sort_field: sorter.column.sortField,
        sort_dir: sorter.order.replace("end", ""),
      };
  const params = isEmpty(mine_region)
    ? {
        ...sortParams,
        mine_region: undefined,
      }
    : {
        ...sortParams,
        mine_region,
      };

  updateApplicationList(params);
};

const applySortIndicator = (_columns, field, dir) =>
  _columns.map((column) => ({
    ...column,
    sortOrder: column.sortField === field ? dir.concat("end") : false,
  }));

export class NoticeOfWorkTable extends Component {
  transformRowData = (applications) =>
    applications.map((application) => ({
      key: application.application_guid,
      source: Strings.EMPTY_FIELD,
      mine_region: application.mine_region
        ? this.props.mineRegionHash[application.mine_region]
        : Strings.EMPTY_FIELD,
      nowNum: application.trackingnumber || Strings.EMPTY_FIELD,
      mineGuid: application.mine_guid || Strings.EMPTY_FIELD,
      mineName: application.mine_name || Strings.EMPTY_FIELD,
      nowType: application.noticeofworktype || Strings.EMPTY_FIELD,
      status: application.status || Strings.EMPTY_FIELD,
      date: formatDate(application.receiveddate) || Strings.EMPTY_FIELD,
    }));

  filterProperties = (name, field) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys }) => {
      return (
        <div style={{ padding: 8 }}>
          <Input
            ref={(node) => {
              this.searchInput = node && node.props.value;
            }}
            placeholder={`Search ${name}`}
            value={selectedKeys[0] || this.props.searchParams[field]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => {
              this.props.handleSearch({ [field]: this.searchInput });
            }}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Button
            type="primary"
            onClick={() => {
              this.props.handleSearch({ [field]: this.searchInput });
            }}
            icon="search"
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              this.props.handleSearch({ [field]: null });
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

  columns = () => [
    {
      title: "Source",
      dataIndex: "source",
      render: (text) => <div title="Source">{text}</div>,
    },
    {
      title: "Region",
      dataIndex: "mine_region",
      render: (text) => <div title="Region">{text}</div>,
      filteredValue: this.props.searchParams.mine_region,
      filters: this.props.mineRegionOptions
        ? optionsFilterAdapter(this.props.mineRegionOptions)
        : [],
    },
    {
      title: "NoW No.",
      dataIndex: "nowNum",
      sortField: "trackingnumber",
      render: (text, record) => (
        <Link to={router.NOTICE_OF_WORK_APPLICATION.dynamicRoute(record.key)}>{text}</Link>
      ),
      sorter: true,
      ...this.filterProperties("NoW No.", "trackingnumber"),
    },
    {
      title: "Mine",
      dataIndex: "mineName",
      render: (text, record) =>
        record.mineGuid ? (
          <Link to={router.MINE_NOW_APPLICATIONS.dynamicRoute(record.mineGuid)}>{text}</Link>
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
      ...this.filterProperties("NoW Type", "noticeofworktype"),
    },
    {
      title: "Application Status",
      dataIndex: "status",
      sortField: "status",
      render: (text) => <div title="Application Status">{text}</div>,
      sorter: true,
      ...this.filterProperties("Status", "status"),
    },
    {
      title: "Import Date",
      dataIndex: "date",
      sortField: "receiveddate",
      render: (text) => <div title="Import Date">{text}</div>,
      sorter: true,
    },
  ];

  render() {
    return (
      <Table
        align="left"
        pagination={false}
        columns={applySortIndicator(
          this.columns(this.props),
          this.props.sortField,
          this.props.sortDir
        )}
        dataSource={this.transformRowData(this.props.noticeOfWorkApplications)}
        locale={{ emptyText: <NullScreen type="no-results" /> }}
        onChange={handleTableChange(this.props.handleSearch)}
      />
    );
  }
}

NoticeOfWorkTable.propTypes = propTypes;
NoticeOfWorkTable.defaultProps = defaultProps;

export default NoticeOfWorkTable;

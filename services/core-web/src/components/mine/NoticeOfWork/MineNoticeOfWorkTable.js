import React, { Component } from "react";
import { Table, Icon, Input, Button } from "antd";
import { Link } from "react-router-dom";
import { isEmpty } from "lodash";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@/constants/strings";
import * as router from "@/constants/routes";
import NullScreen from "@/components/common/NullScreen";
import TableLoadingWrapper from "@/components/common/wrappers/TableLoadingWrapper";
import { formatDate, getTableHeaders } from "@/utils/helpers";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import * as Permission from "@/constants/permissions";

/**
 * @class MineNoticeOfWorkTable - list of mine notice of work applications
 */
const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  noticeOfWorkApplications: PropTypes.arrayOf(CustomPropTypes.nowApplication),
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
  searchParams: PropTypes.objectOf(PropTypes.string),
  isLoaded: PropTypes.bool.isRequired,
};

const defaultProps = {
  sortField: null,
  sortDir: null,
  noticeOfWorkApplications: [],
  searchParams: {},
};

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

const transformRowData = (applications) =>
  applications.map((application) => ({
    key: application.now_application_guid,
    nowNum: application.tracking_number || Strings.EMPTY_FIELD,
    mineGuid: application.mine_guid || Strings.EMPTY_FIELD,
    mineName: application.mine_name || Strings.EMPTY_FIELD,
    nowType: application.notice_of_work_type_description || Strings.EMPTY_FIELD,
    status: application.now_application_status_description || Strings.EMPTY_FIELD,
    date: formatDate(application.received_date) || Strings.EMPTY_FIELD,
  }));

export class MineNoticeOfWorkTable extends Component {
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
      title: "NoW No.",
      dataIndex: "nowNum",
      sortField: "tracking_number",
      render: (text, record) => (
        <Link to={router.NOTICE_OF_WORK_INITIAL_APPLICATION.dynamicRoute(record.key)}>{text}</Link>
      ),
      sorter: true,
      ...this.filterProperties("NoW No.", "tracking_number"),
    },
    {
      title: "NoW Type",
      dataIndex: "nowType",
      sortField: "notice_of_work_type_description",
      render: (text) => <div title="NoW Mine Type">{text}</div>,
      sorter: true,
      ...this.filterProperties("NoW Type", "notice_of_work_type_description"),
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
      sortField: "received_date",
      render: (text) => <div title="Import Date">{text}</div>,
      sorter: true,
    },
    {
      title: "",
      dataIndex: "verify",
      width: 150,
      render: (text, record) =>
        record.key && (
          <div title="">
            <AuthorizationWrapper inTesting>
              <AuthorizationWrapper permission={Permission.ADMIN}>
                <Link to={router.NOTICE_OF_WORK_APPLICATION.dynamicRoute(record.key)}>
                  <img src={EDIT_OUTLINE_VIOLET} alt="Edit NoW" />
                </Link>
              </AuthorizationWrapper>
            </AuthorizationWrapper>
          </div>
        ),
    },
  ];

  render() {
    return (
      <TableLoadingWrapper
        condition={this.props.isLoaded}
        tableHeaders={getTableHeaders(this.columns())}
      >
        <Table
          align="left"
          pagination={false}
          columns={applySortIndicator(
            this.columns(this.props),
            this.props.sortField,
            this.props.sortDir
          )}
          dataSource={transformRowData(this.props.noticeOfWorkApplications)}
          locale={{
            emptyText: <NullScreen type="notice-of-work" />,
          }}
          onChange={handleTableChange(this.props.handleSearch)}
        />
      </TableLoadingWrapper>
    );
  }
}

MineNoticeOfWorkTable.propTypes = propTypes;
MineNoticeOfWorkTable.defaultProps = defaultProps;

export default MineNoticeOfWorkTable;

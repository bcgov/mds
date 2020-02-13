import React, { Component } from "react";
import { Icon, Input, Button, Badge } from "antd";
import { Link, withRouter } from "react-router-dom";
import { isEmpty } from "lodash";
import PropTypes from "prop-types";
import { formatDate } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";
import NullScreen from "@/components/common/NullScreen";
import CoreTable from "@/components/common/CoreTable";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import * as Permission from "@/constants/permissions";
import { getNoticeOfWorkApplicationBadgeStatusType } from "@/constants/theme";

/**
 * @class MineNoticeOfWorkTable - list of mine notice of work applications
 */
const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  noticeOfWorkApplications: PropTypes.arrayOf(CustomPropTypes.importedNOWApplication),
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
  searchParams: PropTypes.objectOf(PropTypes.string),
  isLoaded: PropTypes.bool.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }).isRequired,
  isMajorMine: PropTypes.bool.isRequired,
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
    nowNum: application.now_number || Strings.EMPTY_FIELD,
    mineGuid: application.mine_guid || Strings.EMPTY_FIELD,
    mineName: application.mine_name || Strings.EMPTY_FIELD,
    nowType: application.notice_of_work_type_description || Strings.EMPTY_FIELD,
    status: application.now_application_status_description || Strings.EMPTY_FIELD,
    date: formatDate(application.received_date) || Strings.EMPTY_FIELD,
    location: PropTypes.object,
  }));

const pageTitle = (mineName, isMajorMine) => {
  const applicationType = isMajorMine ? "Permit Applications" : " Notice of Work Applications";
  return `${mineName} ${applicationType}`;
};
export class MineNoticeOfWorkTable extends Component {
  createLinkTo = (route, record) => {
    return {
      pathname: route.dynamicRoute(record.key),
      state: {
        noticeOfWorkPageFromRoute: {
          route: this.props.location.pathname + this.props.location.search,
          title: pageTitle(record.mineName, this.props.isMajorMine),
        },
      },
    };
  };

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
      title: "Number",
      dataIndex: "nowNum",
      sortField: "now_number",
      render: (text, record) => (
        <Link to={this.createLinkTo(router.VIEW_NOTICE_OF_WORK_APPLICATION, record)}>{text}</Link>
      ),
      sorter: true,
      ...this.filterProperties("Number", "now_number"),
    },
    {
      title: "Type",
      dataIndex: "nowType",
      sortField: "notice_of_work_type_description",
      render: (text) => <div title="Type">{text}</div>,
      sorter: true,
      ...this.filterProperties("Type", "notice_of_work_type_description"),
    },
    {
      title: "Status",
      dataIndex: "status",
      sortField: "status",
      render: (text) => (
        <div title="Status">
          <Badge status={getNoticeOfWorkApplicationBadgeStatusType(text)} text={text} />
        </div>
      ),
      sorter: true,
      ...this.filterProperties("Status", "status"),
    },
    {
      title: "Received",
      dataIndex: "date",
      sortField: "received_date",
      render: (text) => <div title="Received">{text}</div>,
      sorter: true,
    },
    {
      title: "",
      dataIndex: "verify",
      width: 150,
      render: (text, record) =>
        record.key && (
          <div title="" className="btn--middle flex">
            <AuthorizationWrapper inTesting>
              <AuthorizationWrapper permission={Permission.ADMIN}>
                <Link to={this.createLinkTo(router.NOTICE_OF_WORK_APPLICATION, record)}>
                  <img src={EDIT_OUTLINE_VIOLET} alt="Edit NoW" className="padding-large--right" />
                </Link>
              </AuthorizationWrapper>
            </AuthorizationWrapper>
            <Link to={this.createLinkTo(router.VIEW_NOTICE_OF_WORK_APPLICATION, record)}>
              <Icon type="eye" className="icon-lg icon-svg-filter padding-large--left" />
            </Link>
          </div>
        ),
    },
  ];

  render() {
    return (
      <CoreTable
        condition={this.props.isLoaded}
        columns={applySortIndicator(
          this.columns(this.props),
          this.props.sortField,
          this.props.sortDir
        )}
        dataSource={transformRowData(this.props.noticeOfWorkApplications)}
        tableProps={{
          align: "left",
          pagination: false,
          locale: {
            emptyText: <NullScreen type="notice-of-work" />,
          },
          onChange: handleTableChange(this.props.handleSearch),
        }}
      />
    );
  }
}

MineNoticeOfWorkTable.propTypes = propTypes;
MineNoticeOfWorkTable.defaultProps = defaultProps;

export default withRouter(MineNoticeOfWorkTable);

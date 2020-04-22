import React, { Component } from "react";
import { Icon, Input, Button, Badge } from "antd";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import {
  formatDate,
  optionsFilterLabelAndValue,
  optionsFilterLabelOnly,
} from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";
import NullScreen from "@/components/common/NullScreen";
import CoreTable from "@/components/common/CoreTable";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import { getNoticeOfWorkApplicationBadgeStatusType } from "@/constants/theme";

/**
 * @class NoticeOfWorkTable - paginated list of notice of work applications
 */

const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  noticeOfWorkApplications: PropTypes.arrayOf(CustomPropTypes.importedNOWApplication),
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
  searchParams: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  applicationStatusOptions: CustomPropTypes.options.isRequired,
  applicationTypeOptions: CustomPropTypes.options.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }).isRequired,
};

const defaultProps = {
  sortField: null,
  sortDir: null,
  noticeOfWorkApplications: [],
};

const handleTableChange = (updateApplicationList) => (pagination, filters, sorter) => {
  const params = {
    results: pagination.pageSize,
    page: pagination.current,
    sort_field: sorter.order ? sorter.field : undefined,
    sort_dir: sorter.order ? sorter.order.replace("end", "") : sorter.order,
    ...filters,
  };
  updateApplicationList(params);
};

const applySortIndicator = (_columns, field, dir) =>
  _columns.map((column) => ({
    ...column,
    sortOrder: dir && column.sortField === field ? dir.concat("end") : false,
  }));

const pageTitle = "Browse Notices of Work";

export class NoticeOfWorkTable extends Component {
  createLinkTo = (route, record) => {
    return {
      pathname: route.dynamicRoute(record.key),
      state: {
        noticeOfWorkPageFromRoute: {
          route: this.props.location.pathname + this.props.location.search,
          title: pageTitle,
        },
      },
    };
  };

  transformRowData = (applications) =>
    applications.map((application) => ({
      key: application.now_application_guid,
      now_application_guid: application.now_application_guid,
      now_number: application.now_number || Strings.EMPTY_FIELD,
      mine_name: application.mine_name || Strings.EMPTY_FIELD,
      mine_guid: application.mine_guid,
      mine_region: application.mine_region
        ? this.props.mineRegionHash[application.mine_region]
        : Strings.EMPTY_FIELD,
      notice_of_work_type_description:
        application.notice_of_work_type_description || Strings.EMPTY_FIELD,
      lead_inspector_name: application.lead_inspector_name || Strings.EMPTY_FIELD,
      lead_inspector_party_guid: application.lead_inspector_party_guid,
      now_application_status_description:
        application.now_application_status_description || Strings.EMPTY_FIELD,
      received_date: formatDate(application.received_date) || Strings.EMPTY_FIELD,
      originating_system: application.originating_system || Strings.EMPTY_FIELD,
    }));

  filterProperties = (name, field) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys }) => {
      return (
        <div style={{ padding: 8 }}>
          <Input
            id={field}
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
            allowClear
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
      key: "now_number",
      dataIndex: "now_number",
      sortField: "now_number",
      sorter: true,
      ...this.filterProperties("Number", "now_number"),
      render: (text) => <div title="Number">{text}</div>,
    },
    {
      title: "Mine",
      key: "mine_name",
      dataIndex: "mine_name",
      sortField: "mine_name",
      sorter: true,
      ...this.filterProperties("Mine", "mine_name"),
      render: (text, record) =>
        (record.mine_guid && (
          <Link to={router.MINE_NOW_APPLICATIONS.dynamicRoute(record.mine_guid)} title="Mine">
            {text}
          </Link>
        )) || <div title="Mine">{text}</div>,
    },
    {
      title: "Region",
      key: "mine_region",
      dataIndex: "mine_region",
      sortField: "mine_region",
      sorter: true,
      filtered: true,
      filteredValue: this.props.searchParams.mine_region
        ? [this.props.searchParams.mine_region]
        : [],
      filters: this.props.mineRegionOptions
        ? optionsFilterLabelAndValue(this.props.mineRegionOptions).sort((a, b) =>
            a.value > b.value ? 1 : -1
          )
        : [],
      render: (text) => <div title="Region">{text}</div>,
    },
    {
      title: "Type",
      key: "notice_of_work_type_description",
      dataIndex: "notice_of_work_type_description",
      sortField: "notice_of_work_type_description",
      sorter: true,
      filtered: true,
      filteredValue: this.props.searchParams.notice_of_work_type_description
        ? [this.props.searchParams.notice_of_work_type_description]
        : [],
      filters: optionsFilterLabelOnly(this.props.applicationTypeOptions).sort((a, b) =>
        a.value > b.value ? 1 : -1
      ),
      render: (text) => <div title="Type">{text}</div>,
    },
    {
      title: "Lead Inspector",
      key: "lead_inspector_name",
      dataIndex: "lead_inspector_name",
      sortField: "lead_inspector_name",
      sorter: true,
      ...this.filterProperties("Lead Inspector", "lead_inspector_name"),
      render: (text, record) =>
        (record.lead_inspector_party_guid && (
          <Link
            to={router.PARTY_PROFILE.dynamicRoute(record.lead_inspector_party_guid)}
            title="Lead Inspector"
          >
            {text}
          </Link>
        )) || <div title="Lead Inspector">{text}</div>,
    },
    {
      title: "Status",
      key: "now_application_status_description",
      dataIndex: "now_application_status_description",
      sortField: "now_application_status_description",
      sorter: true,
      filtered: true,
      filteredValue: this.props.searchParams.now_application_status_description
        ? [this.props.searchParams.now_application_status_description]
        : [],
      filters: optionsFilterLabelOnly(this.props.applicationStatusOptions).sort((a, b) =>
        a.value > b.value ? 1 : -1
      ),
      render: (text) => (
        <div title="Status">
          <Badge status={getNoticeOfWorkApplicationBadgeStatusType(text)} text={text} />
        </div>
      ),
    },
    {
      title: "Received",
      key: "received_date",
      dataIndex: "received_date",
      sortField: "received_date",
      sorter: true,
      render: (text) => <div title="Received">{text}</div>,
    },
    {
      title: "Source",
      key: "originating_system",
      dataIndex: "originating_system",
      sortField: "originating_system",
      sorter: true,
      filtered: true,
      filteredValue: this.props.searchParams.originating_system
        ? [this.props.searchParams.originating_system]
        : [],
      filters: [
        { text: "Core", value: "Core" },
        { text: "NROS", value: "NROS" },
        { text: "VFCBC", value: "VFCBC" },
        { text: "MMS", value: "MMS" },
      ],
      render: (text) => <div title="Source">{text}</div>,
    },
    {
      key: "operations",
      render: (text, record) =>
        record.key && (
          <div className="btn--middle flex">
            <AuthorizationWrapper inTesting>
              <Link to={this.createLinkTo(router.NOTICE_OF_WORK_APPLICATION, record)}>
                <img
                  src={EDIT_OUTLINE_VIOLET}
                  title="Edit"
                  alt="Edit"
                  className="padding-md--right"
                />
              </Link>
            </AuthorizationWrapper>
            <Link to={this.createLinkTo(router.VIEW_NOTICE_OF_WORK_APPLICATION, record)}>
              <Icon
                type="eye"
                title="View"
                className="icon-lg icon-svg-filter padding-large--left"
              />
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
        dataSource={this.transformRowData(this.props.noticeOfWorkApplications)}
        tableProps={{
          align: "left",
          pagination: false,
          locale: { emptyText: <NullScreen type="no-results" /> },
          onChange: handleTableChange(this.props.handleSearch),
        }}
      />
    );
  }
}

NoticeOfWorkTable.propTypes = propTypes;
NoticeOfWorkTable.defaultProps = defaultProps;

export default withRouter(NoticeOfWorkTable);

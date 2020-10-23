import React, { Component } from "react";
import { Badge, Button } from "antd";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { formatDate } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";
import CoreTable from "@/components/common/CoreTable";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { getNoticeOfWorkApplicationBadgeStatusType } from "@/constants/theme";
import LinkButton from "@/components/common/LinkButton";
import { isEmpty } from "lodash";
import { downloadNowDocument } from "@common/utils/actionlessNetworkCalls";

/**
 * @class MineNoticeOfWorkTable - list of mine notice of work applications
 */
const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  noticeOfWorkApplications: PropTypes.arrayOf(CustomPropTypes.importedNOWApplication),
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
  isLoaded: PropTypes.bool.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }).isRequired,
  isMajorMine: PropTypes.bool.isRequired,
};

const defaultProps = {
  sortField: undefined,
  sortDir: undefined,
  noticeOfWorkApplications: [],
};

const handleTableChange = (handleSearch) => (pagination, filters, sorter) => {
  const params = {
    sort_field: sorter.order ? sorter.field : undefined,
    sort_dir: sorter.order ? sorter.order.replace("end", "") : undefined,
  };
  handleSearch(params);
};

const applySortIndicator = (_columns, field, dir) =>
  _columns.map((column) => ({
    ...column,
    sortOrder: dir && column.sortField === field ? dir.concat("end") : false,
  }));

const transformRowData = (applications) =>
  applications.map((application) => ({
    key: application.now_application_guid,
    now_number: application.now_number || Strings.EMPTY_FIELD,
    mine_guid: application.mine_guid || Strings.EMPTY_FIELD,
    mine_name: application.mine_name || Strings.EMPTY_FIELD,
    notice_of_work_type_description:
      application.notice_of_work_type_description || Strings.EMPTY_FIELD,
    now_application_status_description:
      application.now_application_status_description || Strings.EMPTY_FIELD,
    received_date: formatDate(application.received_date) || Strings.EMPTY_FIELD,
    originating_system: application.originating_system || Strings.EMPTY_FIELD,
    document:
      application.application_documents.length >= 1 ? application.application_documents[0] : {},
  }));

const pageTitle = (mineName, isMajorMine) => {
  const applicationType = isMajorMine ? "Permit Applications" : "Notice of Work Applications";
  return `${mineName} ${applicationType}`;
};

export class MineNoticeOfWorkTable extends Component {
  createLinkTo = (route, record) => {
    return {
      pathname: route.dynamicRoute(record.key),
      state: {
        noticeOfWorkPageFromRoute: {
          route: this.props.location.pathname + this.props.location.search,
          title: pageTitle(record.mine_name, this.props.isMajorMine),
        },
      },
    };
  };

  columns = () => [
    {
      title: "Number",
      dataIndex: "now_number",
      sortField: "now_number",
      render: (text) => <div title="Number">{text}</div>,
      sorter: true,
    },
    {
      title: "Type",
      dataIndex: "notice_of_work_type_description",
      sortField: "notice_of_work_type_description",
      render: (text) => <div title="Type">{text}</div>,
      sorter: true,
    },
    {
      title: "Status",
      dataIndex: "now_application_status_description",
      sortField: "now_application_status_description",
      render: (text) => (
        <div title="Status">
          <Badge status={getNoticeOfWorkApplicationBadgeStatusType(text)} text={text} />
        </div>
      ),
      sorter: true,
    },
    {
      title: "Received",
      dataIndex: "received_date",
      sortField: "received_date",
      render: (text) => <div title="Received">{text}</div>,
      sorter: true,
    },
    {
      title: "Source",
      dataIndex: "originating_system",
      sortField: "originating_system",
      render: (text) => <div title="Source">{text}</div>,
      sorter: true,
    },
    {
      title: "Application",
      dataIndex: "document",
      kay: "document",
      render: (text, record) =>
        !isEmpty(text) ? (
          <div title="Application" className="cap-col-height">
            <LinkButton onClick={() => downloadNowDocument(text.id, record.key, text.filename)}>
              <span>{text.filename}</span>
            </LinkButton>
          </div>
        ) : (
          Strings.EMPTY_FIELD
        ),
    },
    {
      dataIndex: "operations",
      render: (text, record) =>
        record.key && (
          <div className="btn--middle flex">
            <AuthorizationWrapper inTesting>
              <Link to={this.createLinkTo(router.NOTICE_OF_WORK_APPLICATION, record)}>
                <Button type="primary">Open</Button>
              </Link>
            </AuthorizationWrapper>
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
          onChange: handleTableChange(this.props.handleSearch),
        }}
      />
    );
  }
}

MineNoticeOfWorkTable.propTypes = propTypes;
MineNoticeOfWorkTable.defaultProps = defaultProps;

export default withRouter(MineNoticeOfWorkTable);

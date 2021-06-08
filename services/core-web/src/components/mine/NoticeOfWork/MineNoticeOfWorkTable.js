import React, { Component } from "react";
import { Badge, Button } from "antd";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { formatDate } from "@common/utils/helpers";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { openDocument } from "@/components/syncfusion/DocumentViewer";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";
import CoreTable from "@/components/common/CoreTable";
import { getApplicationStatusType } from "@/constants/theme";
import DocumentLink from "@/components/common/DocumentLink";
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
  openDocument: PropTypes.func.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }).isRequired,
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
    now_application_guid: application.now_application_guid,
    now_number: application.now_number || Strings.EMPTY_FIELD,
    mine_guid: application.mine_guid || Strings.EMPTY_FIELD,
    mine_name: application.mine_name || Strings.EMPTY_FIELD,
    notice_of_work_type_description:
      application.notice_of_work_type_description || Strings.EMPTY_FIELD,
    now_application_status_description:
      application.now_application_status_description || Strings.EMPTY_FIELD,
    received_date: formatDate(application.received_date) || Strings.EMPTY_FIELD,
    originating_system: application.originating_system || Strings.EMPTY_FIELD,
    document: application.application_documents?.[0] || {},
    is_historic: application.is_historic,
  }));

export class MineNoticeOfWorkTable extends Component {
  createLinkTo = (route, record) => {
    return {
      pathname: route.dynamicRoute(record.key),
      state: {
        applicationPageFromRoute: {
          route: this.props.location.pathname + this.props.location.search,
          title: `${record.mine_name} Notice of Work Applications`,
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
          <Badge status={getApplicationStatusType(text)} text={text} />
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
            <DocumentLink
              documentManagerGuid={text.document_manager_guid}
              documentName={text.filename}
              onClickAlternative={() =>
                downloadNowDocument(text.id, record.now_application_guid, text.filename)
              }
              truncateDocumentName={false}
            />
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
            <Link to={this.createLinkTo(router.NOTICE_OF_WORK_APPLICATION, record)}>
              <Button type="primary" disabled={record.is_historic}>
                Open
              </Button>
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
          onChange: handleTableChange(this.props.handleSearch),
        }}
      />
    );
  }
}

MineNoticeOfWorkTable.propTypes = propTypes;
MineNoticeOfWorkTable.defaultProps = defaultProps;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openDocument,
    },
    dispatch
  );

export default withRouter(connect(null, mapDispatchToProps)(MineNoticeOfWorkTable));

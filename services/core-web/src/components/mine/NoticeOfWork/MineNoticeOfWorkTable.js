import React, { Component } from "react";
import { Badge, Button } from "antd";
import { Link, withRouter } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import * as Strings from "@mds/common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";
import { getApplicationStatusType } from "@/constants/theme";
import DocumentLink from "@/components/common/DocumentLink";
import { isEmpty } from "lodash";
import { downloadNowDocument } from "@common/utils/actionlessNetworkCalls";
import CoreTable from "@mds/common/components/common/CoreTable";
import {
  renderDateColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";

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
    received_date: application.received_date,
    originating_system: application.originating_system || Strings.EMPTY_FIELD,
    document:
      application.application_documents?.length > 0 ? application.application_documents[0] : {},
    is_historic: application.is_historic,
    lead_inspector_name: application.lead_inspector_name || Strings.EMPTY_FIELD,
    lead_inspector_party_guid: application.lead_inspector_party_guid,
    issuing_inspector_name: application.issuing_inspector_name || Strings.EMPTY_FIELD,
    issuing_inspector_party_guid: application.issuing_inspector_party_guid,
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
    renderTextColumn("now_number", "Number", true),
    renderTextColumn("notice_of_work_type_description", "Type", true),
    {
      title: "Status",
      dataIndex: "now_application_status_description",
      key: "now_application_status_description",
      sortField: "now_application_status_description",
      render: (text) => (
        <div title="Status">
          <Badge status={getApplicationStatusType(text)} text={text} />
        </div>
      ),
      sorter: true,
    },
    {
      title: "Lead Inspector",
      dataIndex: "lead_inspector_name",
      key: "lead_inspector_name",
      sortField: "lead_inspector_name",
      render: (text, record) =>
        (record.lead_inspector_party_guid && (
          <Link
            to={router.PARTY_PROFILE.dynamicRoute(record.lead_inspector_party_guid)}
            title="Lead Inspector"
          >
            {text}
          </Link>
        )) || <div title="Lead Inspector">{text}</div>,
      sorter: true,
    },
    {
      title: "Issuing Inspector",
      dataIndex: "issuing_inspector_name",
      key: "issuing_inspector_name",
      sortField: "issuing_inspector_name",
      render: (text, record) =>
        (record.issuing_inspector_party_guid && (
          <Link
            to={router.PARTY_PROFILE.dynamicRoute(record.issuing_inspector_party_guid)}
            title="Issuing Inspector"
          >
            {text}
          </Link>
        )) || <div title="Issuing Inspector">{text}</div>,
      sorter: true,
    },
    renderDateColumn("received_date", "Received", true, null, Strings.EMPTY_FIELD),
    renderTextColumn("originating_system", "Source", true),
    {
      title: "Application",
      dataIndex: "document",
      key: "document",
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
      key: "operations",
      render: (record) =>
        record.key && (
          <div className="btn--middle flex">
            <Link to={this.createLinkTo(router.NOTICE_OF_WORK_APPLICATION, record)}>
              <Button type="primary" disabled={record.is_historic}>
                Open
              </Button>
            </Link>
            <Link to={this.createLinkTo(router.VIEW_NOTICE_OF_WORK_APPLICATION, record)}>
              <Button type="primary" size="small" ghost>
                <EyeOutlined className="icon-lg icon-svg-filter" />
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
        onChange={handleTableChange(this.props.handleSearch)}
      />
    );
  }
}

MineNoticeOfWorkTable.propTypes = propTypes;
MineNoticeOfWorkTable.defaultProps = defaultProps;

export default withRouter(MineNoticeOfWorkTable);

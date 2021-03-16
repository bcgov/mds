import React, { Component } from "react";
import { Badge, Tooltip, Table } from "antd";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { formatDate, truncateFilename } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import { MinusSquareFilled, PlusSquareFilled } from "@ant-design/icons";

import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import CoreTable from "@/components/common/CoreTable";
import { getApplicationStatusType } from "@/constants/theme";
import LinkButton from "@/components/common/LinkButton";
import { isEmpty } from "lodash";

/**
 * @class MineAdministrativeAmendmentTable - list of mine administrative applications
 */
const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  administrativeAmendmentApplications: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
  isLoaded: PropTypes.bool.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }).isRequired,
  onExpand: PropTypes.func.isRequired,
  expandedRowKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const defaultProps = {
  sortField: undefined,
  sortDir: undefined,
  administrativeAmendmentApplications: [],
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

const transformRowData = (applications) => {
  return applications.map((application) => {
    const { permittee } = application;
    const permittee_name = application.permittee
      ? [permittee.first_name, permittee.party_name].filter(Boolean).join(" ")
      : null;

    return {
      key: application.now_application_guid,
      administrative_amendment_number: application.now_number || Strings.EMPTY_FIELD,
      mine_guid: application.mine_guid || Strings.EMPTY_FIELD,
      mine_name: application.mine_name || Strings.EMPTY_FIELD,
      application_type_description:
        application.notice_of_work_type_description || Strings.EMPTY_FIELD,
      status_reason: application.status_reason || Strings.EMPTY_FIELD,
      application_status_description:
        application.now_application_status_description || Strings.EMPTY_FIELD,
      received_date: formatDate(application.received_date) || Strings.EMPTY_FIELD,
      documents: application.documents,
      amendment_number:
        application.permit_amendments && application.permit_amendments.length > 0
          ? application.permit_amendments[0].amendment_number
          : Strings.EMPTY_FIELD,
      application_trigger_type_codes: application.application_trigger_type_codes,
      issuing_inspector_name: application.issuing_inspector_name,
      permittee_name: isEmpty(permittee_name) ? Strings.EMPTY_FIELD : permittee_name,
    };
  });
};

const transformExpandedRowData = (record) => {
  return {
    ...record,
    documents: record.documents.map((doc) => ({
      mine_guid: doc.mine_document.mine_guid,
      document_manager_guid: doc.mine_document.document_manager_guid,
      document_name: doc.mine_document.document_name,
    })),
  };
};

const RenderTableExpandIcon = (rowProps) => (
  <a
    role="link"
    className="expand-row-icon"
    onClick={(e) => rowProps.onExpand(rowProps.record, e)}
    onKeyPress={(e) => rowProps.onExpand(rowProps.record, e)}
    style={{ cursor: "pointer" }}
    tabIndex="0"
  >
    {rowProps.expanded ? (
      <Tooltip title="Click to hide amendment details." placement="right" mouseEnterDelay={1}>
        <MinusSquareFilled className="icon-lg--lightgrey" />
      </Tooltip>
    ) : (
      <Tooltip title="Click to hide amendment details." placement="right" mouseEnterDelay={1}>
        <PlusSquareFilled className="icon-lg--lightgrey" />
      </Tooltip>
    )}
  </a>
);

export class MineAdministrativeAmendmentTable extends Component {
  createLinkTo = (route, record) => {
    return {
      pathname: route.dynamicRoute(record.key),
      state: {
        administrativeAmendmentPageFromRoute: {
          route: this.props.location.pathname + this.props.location.search,
          title: "Administrative amendments",
        },
      },
    };
  };

  columns = () => [
    {
      title: "Application",
      dataIndex: "administrative_amendment_number",
      sortField: "administrative_amendment_number",
      render: (text) => <div title="Number">{text}</div>,
      sorter: true,
    },
    {
      title: "Source Amendment",
      dataIndex: "amendment_number",
      sortField: "amendment_number",
      render: (text) => <div title="Amendment Number">{text}</div>,
      sorter: true,
    },
    {
      title: "Trigger Types",
      dataIndex: "application_trigger_type_codes",
      sorter: false,
      render: (trigger) => (
        <div className="cap-col-height">
          {(trigger &&
            trigger.length > 0 &&
            trigger.map((item) => <div>{item.description}</div>)) ||
            Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "application_type_description",
      sortField: "application_type_description",
      render: (text) => <div title="Type">{text}</div>,
      sorter: true,
    },
    {
      title: "Issuing Inspector",
      dataIndex: "issuing_inspector_name",
      sortField: "issuing_inspector_name",
      render: (text) => <div title="Issuing Inspector">{text}</div>,
      sorter: true,
    },
    {
      title: "Status",
      dataIndex: "application_status_description",
      sortField: "application_status_description",
      render: (text) => (
        <div title="Status">
          <Badge status={getApplicationStatusType(text)} text={text} />
        </div>
      ),
      sorter: true,
    },
    {
      title: "Permittee",
      dataIndex: "permittee_name",
      sortField: "permittee_name",
      render: (text) => <div title="Permittee">{text}</div>,
      sorter: true,
    },
    {
      title: "Application Date",
      dataIndex: "received_date",
      sortField: "received_date",
      render: (text) => <div title="Received">{text}</div>,
      sorter: true,
    },
    // {
    //   title: "Approval Date",
    //   dataIndex: "",
    //   sortField: "",
    //   render: (text) => <div title="Number">{text}</div>,
    //   sorter: true,
    // },
    // {
    //   title: "Actions",
    //   dataIndex: "",
    //   sortField: "",
    //   render: (text) => <div title="Number">{text}</div>,
    //   sorter: true,
    // },
  ];

  administrativeAmendmentDetail = (record) => {
    // TODO remove mock
    const expandedColumns = [
      {
        title: "Reason For Status",
        dataIndex: "status_reason",
        key: "status_reason",
      },
      {
        title: "Application Request Document",
        dataIndex: "documents",
        key: "documents",
        render: (text) => (
          <div className="cap-col-height">
            {(text &&
              text.length > 0 &&
              text.map((file) => (
                <LinkButton
                  key={file.document_manager_guid}
                  onClick={() => downloadFileFromDocumentManager(file)}
                  title={file.document_name}
                >
                  {truncateFilename(file.document_name)}
                  <br />
                </LinkButton>
              ))) ||
              Strings.EMPTY_FIELD}
          </div>
        ),
      },
    ];

    return (
      <Table
        align="left"
        pagination={false}
        columns={expandedColumns}
        dataSource={[transformExpandedRowData(record)]}
        locale={{ emptyText: "No Data Yet" }}
      />
    );
  };

  render() {
    return (
      <CoreTable
        condition={this.props.isLoaded}
        dataSource={transformRowData(this.props.administrativeAmendmentApplications)}
        columns={applySortIndicator(
          this.columns(this.props),
          this.props.sortField,
          this.props.sortDir
        )}
        tableProps={{
          align: "left",
          pagination: false,
          onChange: handleTableChange(this.props.handleSearch),
          expandIcon: RenderTableExpandIcon,
          expandRowByClick: true,
          expandedRowRender: this.administrativeAmendmentDetail,
          expandedRowKeys: this.props.expandedRowKeys,
          onExpand: this.props.onExpand,
        }}
      />
    );
  }
}

MineAdministrativeAmendmentTable.propTypes = propTypes;
MineAdministrativeAmendmentTable.defaultProps = defaultProps;

export default withRouter(MineAdministrativeAmendmentTable);

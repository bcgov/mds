import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import * as Strings from "@common/constants/strings";
import {
  formatDate,
  dateSorter,
  nullableStringSorter,
  formatComplianceCodeValueOrLabel,
} from "@common/utils/helpers";
import {
  getMineReportCategoryOptionsHash,
  getMineReportStatusOptionsHash,
  getMineReportDefinitionHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { Link } from "react-router-dom";
import { Badge } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { MineReportActions } from "@/components/mine/Reports/MineReportActions";
import DocumentLink from "@/components/common/DocumentLink";
import CoreTable from "@/components/common/CoreTable";
import * as router from "@/constants/routes";
import { getReportSubmissionBadgeStatusType } from "@/constants/theme";

const propTypes = {
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  mineReportCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineReportStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  mineReportDefinitionHash: PropTypes.objectOf(PropTypes.any).isRequired,
  openEditReportModal: PropTypes.func.isRequired,
  handleEditReport: PropTypes.func.isRequired,
  handleRemoveReport: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  handleTableChange: PropTypes.func,
  filters: PropTypes.objectOf(PropTypes.any),
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
  isPaginated: PropTypes.bool,
  isDashboardView: PropTypes.bool,
  mineReportType: PropTypes.string.isRequired,
};

const defaultProps = {
  handleTableChange: () => {},
  filters: {},
  sortField: undefined,
  sortDir: undefined,
  isPaginated: false,
  isDashboardView: false,
};

export const MineReportTable = (props) => {
  const hideColumn = (condition) => (condition ? "column-hide" : "");

  const getComplianceCodeValue = (guid) => {
    return props.mineReportDefinitionHash && props.mineReportDefinitionHash[guid]
      ? formatComplianceCodeValueOrLabel(
          props.mineReportDefinitionHash[guid].compliance_articles[0],
          false
        )
      : null;
  };

  const columns = [
    {
      title: "Mine",
      key: "mine_name",
      dataIndex: "mine_name",
      sortField: "mine_name",
      sorter: props.isDashboardView,
      className: hideColumn(!props.isDashboardView),
      render: (text, record) => (
        <div title="Mine" className={hideColumn(!props.isDashboardView)}>
          <Link to={router.MINE_SUMMARY.dynamicRoute(record.mine_guid)}>{text}</Link>
        </div>
      ),
    },
    {
      title:
        props.mineReportType === Strings.MINE_REPORTS_TYPE.permitRequiredReports
          ? "Report Type"
          : "Report Name",
      key: "report_name",
      dataIndex: "report_name",
      sortField: "report_name",
      sorter: props.isDashboardView || ((a, b) => a.report_name.localeCompare(b.report_name)),
      render: (text) => <div title="Report Name">{text}</div>,
    },
    {
      title: "Compliance Year",
      key: "submission_year",
      dataIndex: "submission_year",
      sortField: "submission_year",
      sorter: props.isDashboardView || ((a, b) => (a.submission_year < b.submission_year ? -1 : 1)),
      render: (text) => <div title="Compliance Year">{text}</div>,
    },
    {
      title: "Status",
      key: "mine_report_status_code",
      dataIndex: "mine_report_status_code",
      sortField: "mine_report_status_code",
      sorter: props.isDashboardView || nullableStringSorter("mine_report_status_code"),
      render: (text) => (
        <div title="Status">
          <Badge
            status={getReportSubmissionBadgeStatusType(text)}
            text={text || Strings.EMPTY_FIELD}
          />
        </div>
      ),
    },
    {
      title: "Due",
      key: "due_date",
      dataIndex: "due_date",
      sortField: "due_date",
      sorter: props.isDashboardView || dateSorter("due_date"),
      render: (text) => <div title="Due">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Received",
      key: "received_date",
      dataIndex: "received_date",
      sortField: "received_date",
      sorter: props.isDashboardView || dateSorter("received_date"),
      render: (text) => <div title="Received">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Requested By",
      dataIndex: "created_by_idir",
      key: "created_by_idir",
      sortField: "created_by_idir",
      sorter:
        props.isDashboardView || ((a, b) => a.created_by_idir.localeCompare(b.created_by_idir)),
      className: hideColumn(props.isDashboardView),
      render: (text) => (
        <div title="Requested By" className={hideColumn(props.isDashboardView)}>
          {text}
        </div>
      ),
    },
    {
      title: "Documents",
      key: "documents",
      dataIndex: "documents",
      render: (text) => (
        <div title="Documents" className="cap-col-height">
          {(text &&
            text.length > 0 &&
            text.map((file) => (
              <div key={file.mine_document_guid} title={file.document_name}>
                <DocumentLink
                  documentManagerGuid={file.document_manager_guid}
                  documentName={file.document_name}
                />
              </div>
            ))) ||
            Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      key: "operations",
      render: (text, record) => {
        return (
          <div align="right">
            <MineReportActions
              mineReport={record.report}
              openEditReportModal={record.openEditReportModal}
              handleEditReport={record.handleEditReport}
              handleRemoveReport={record.handleRemoveReport}
            />
          </div>
        );
      },
    },
  ];

  const codeSectionColumn = {
    title: "Code Section",
    key: "code_section",
    render: (record) => (
      <div title="Code Section">{getComplianceCodeValue(record.mine_report_definition_guid)}</div>
    ),
  };

  const permitColumn = {
    title: "Permit Number",
    key: "permit_number",
    dataIndex: "permit_number",
    sortField: "permit_number",
    sorter: props.isDashboardView || nullableStringSorter("permit_number"),
    render: (text, record) => (
      <Link to={router.MINE_PERMITS.dynamicRoute(record.mine_guid)}>{text}</Link>
    ),
  };

  if (props.mineReportType === Strings.MINE_REPORTS_TYPE.codeRequiredReports) {
    columns.splice(2, 0, codeSectionColumn);
  }

  if (props.mineReportType === Strings.MINE_REPORTS_TYPE.permitRequiredReports) {
    columns.splice(2, 0, permitColumn);
  }

  const transformRowData = (reports, openEditReportModal, handleEditReport, handleRemoveReport) =>
    reports.map((report) => ({
      key: report.mine_report_guid,
      mine_report_id: Number(report.mine_report_id),
      permit_number: report.permit_number,
      mine_report_guid: report.mine_report_guid,
      mine_report_definition_guid: report.mine_report_definition_guid,
      mine_report_category:
        (report.mine_report_category &&
          report.mine_report_category.length > 0 &&
          report.mine_report_category
            .map((category) => props.mineReportCategoryOptionsHash[category])
            .join(", ")) ||
        Strings.EMPTY_FIELD,
      report_name: report.report_name,
      due_date: formatDate(report.due_date),
      received_date: formatDate(report.received_date),
      submission_year: Number(report.submission_year),
      created_by_idir: report.created_by_idir,
      permit_guid: report.permit_guid || Strings.EMPTY_FIELD,
      mine_report_status_code:
        (report.mine_report_submissions &&
          report.mine_report_submissions.length > 0 &&
          props.mineReportStatusOptionsHash[
            report.mine_report_submissions[report.mine_report_submissions.length - 1]
              .mine_report_submission_status_code
          ]) ||
        null,
      documents:
        report.mine_report_submissions &&
        report.mine_report_submissions.length > 0 &&
        report.mine_report_submissions[report.mine_report_submissions.length - 1].documents &&
        report.mine_report_submissions[report.mine_report_submissions.length - 1].documents.length >
          0
          ? report.mine_report_submissions[report.mine_report_submissions.length - 1].documents
          : [],
      mine_guid: report.mine_guid,
      mine_name: report.mine_name,
      report,
      openEditReportModal,
      handleEditReport,
      handleRemoveReport,
    }));

  const applySortIndicator = (_columns, field, dir) =>
    _columns.map((column) => ({
      ...column,
      sortOrder: dir && column.sortField === field ? dir.concat("end") : false,
    }));

  const handleTableChange = (updateReportList, tableFilters) => (pagination, filters, sorter) => {
    const params = {
      ...tableFilters,
      sort_field: sorter.order ? sorter.field : undefined,
      sort_dir: sorter.order ? sorter.order.replace("end", "") : undefined,
    };
    updateReportList(params);
  };

  return (
    <CoreTable
      condition={props.isLoaded}
      columns={applySortIndicator(columns, props.sortField, props.sortDir)}
      classPrefix="mine-reports"
      dataSource={transformRowData(
        props.mineReports,
        props.openEditReportModal,
        props.handleEditReport,
        props.handleRemoveReport
      )}
      pagination={props.isPaginated}
      onChange={handleTableChange(props.handleTableChange, props.filters)}
    />
  );
};

MineReportTable.propTypes = propTypes;
MineReportTable.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  mineReportCategoryOptionsHash: getMineReportCategoryOptionsHash(state),
  mineReportStatusOptionsHash: getMineReportStatusOptionsHash(state),
  mineReportDefinitionHash: getMineReportDefinitionHash(state),
});

export default connect(mapStateToProps)(MineReportTable);

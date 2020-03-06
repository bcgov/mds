import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import * as Strings from "@common/constants/strings";
import { formatDate, truncateFilename, dateSorter } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { getMineReportCategoryOptionsHash } from "@common/selectors/staticContentSelectors";
import { Link } from "react-router-dom";
import NullScreen from "@/components/common/NullScreen";
import { COLOR } from "@/constants/styles";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { MineReportActions } from "@/components/mine/Reports/MineReportActions";
import LinkButton from "@/components/common/LinkButton";
import CoreTable from "@/components/common/CoreTable";
import * as router from "@/constants/routes";

const { errorRed } = COLOR;

const propTypes = {
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  mineReportCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  openEditReportModal: PropTypes.func.isRequired,
  handleEditReport: PropTypes.func.isRequired,
  handleRemoveReport: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  isDashboardView: PropTypes.bool,
  isPaginated: PropTypes.bool,
};

const defaultProps = {
  isDashboardView: false,
  isPaginated: false,
};

export const MineReportTable = (props) => {
  const hideColumn = (condition) => (condition ? "column-hide" : "");

  const columns = [
    {
      title: "Number",
      key: "mine_report_id",
      dataIndex: "mine_report_id",
      sortField: "mine_report_id",
      sorter: props.isDashboardView || ((a, b) => (a.mine_report_id > b.mine_report_id ? -1 : 1)),
      render: (text, record) => (
        <div title="Number" style={record.isOverdue ? { color: errorRed } : {}}>
          {text}
        </div>
      ),
    },
    {
      title: "Mine",
      key: "mine_name",
      dataIndex: "mine_name",
      sortField: "mine_name",
      sorter: props.isDashboardView,
      className: hideColumn(!props.isDashboardView),
      render: (text, record) => (
        <div
          title="Mine"
          className={hideColumn(!props.isDashboardView)}
          style={record.isOverdue ? { color: errorRed } : {}}
        >
          <Link to={router.MINE_SUMMARY.dynamicRoute(record.mine_guid)}>{text}</Link>
        </div>
      ),
    },
    {
      title: "Report Type",
      key: "mine_report_category",
      dataIndex: "mine_report_category",
      sortField: "mine_report_category",
      sorter:
        props.isDashboardView ||
        ((a, b) => a.mine_report_category.localeCompare(b.mine_report_category)),
      className: hideColumn(!props.isDashboardView),
      render: (text, record) => (
        <div
          title="Report Type"
          className={hideColumn(!props.isDashboardView)}
          style={record.isOverdue ? { color: errorRed } : {}}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Report Name",
      key: "report_name",
      dataIndex: "report_name",
      sortField: "report_name",
      sorter: props.isDashboardView || ((a, b) => a.report_name.localeCompare(b.report_name)),
      render: (text, record) => (
        <div title="Report Name" style={record.isOverdue ? { color: errorRed } : {}}>
          {text}
        </div>
      ),
    },
    {
      title: "Compliance Year",
      key: "submission_year",
      dataIndex: "submission_year",
      sortField: "submission_year",
      sorter: props.isDashboardView || ((a, b) => (a.submission_year > b.submission_year ? -1 : 1)),
      render: (text, record) => (
        <div title="Compliance Year" style={record.isOverdue ? { color: errorRed } : {}}>
          {text}
        </div>
      ),
    },
    {
      title: "Due",
      key: "due_date",
      dataIndex: "due_date",
      sortField: "due_date",
      sorter: props.isDashboardView || dateSorter("due_date"),
      render: (text, record) => (
        <div title="Due" style={record.isOverdue ? { color: errorRed } : {}}>
          {text}
        </div>
      ),
    },
    {
      title: "Received",
      key: "received_date",
      dataIndex: "received_date",
      sortField: "received_date",
      sorter: props.isDashboardView || dateSorter("received_date"),
      render: (text, record) => (
        <div title="Received" style={record.isOverdue ? { color: errorRed } : {}}>
          {text}
        </div>
      ),
    },
    {
      title: "Requested By",
      dataIndex: "created_by_idir",
      key: "created_by_idir",
      sortField: "created_by_idir",
      sorter: props.isDashboardView
        ? false
        : (a, b) => a.created_by_idir.localeCompare(b.created_by_idir),
      className: hideColumn(props.isDashboardView),
      render: (text, record) => (
        <div
          title="Requested By"
          className={hideColumn(props.isDashboardView)}
          style={record.isOverdue ? { color: errorRed } : {}}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Documents",
      key: "documents",
      dataIndex: "documents",
      render: (text, record) => (
        <div
          title="Documents"
          className="cap-col-height"
          style={record.isOverdue ? { color: errorRed } : {}}
        >
          {(text &&
            text.length > 0 &&
            text.map((file) => (
              <div key={file.mine_document_guid} title={file.document_name}>
                <LinkButton onClick={() => downloadFileFromDocumentManager(file)}>
                  {truncateFilename(file.document_name)}
                </LinkButton>
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
          <div title="" align="right">
            <AuthorizationWrapper permission={Permission.EDIT_REPORTS}>
              <MineReportActions
                mineReport={record.report}
                openEditReportModal={record.openEditReportModal}
                handleEditReport={record.handleEditReport}
                handleRemoveReport={record.handleRemoveReport}
              />
            </AuthorizationWrapper>
          </div>
        );
      },
    },
  ];

  const transformRowData = (reports, openEditReportModal, handleEditReport, handleRemoveReport) =>
    reports.map((report) => ({
      key: report.mine_report_guid,
      mine_report_id: report.mine_report_id,
      mine_report_guid: report.mine_report_guid,
      mine_report_definition_guid: report.mine_report_definition_guid,
      mine_report_category:
        (report.mine_report_category &&
          props.mineReportCategoryOptionsHash[report.mine_report_category]) ||
        Strings.EMPTY_FIELD,
      report_name: report.report_name,
      due_date: formatDate(report.due_date) || Strings.EMPTY_FIELD,
      received_date: formatDate(report.received_date) || Strings.EMPTY_FIELD,
      submission_year: report.submission_year,
      created_by_idir: report.created_by_idir,
      permit_guid: report.permit_guid || Strings.EMPTY_FIELD,
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
      isOverdue: report.due_date && Date.parse(report.due_date) < new Date(),
      report,
      openEditReportModal,
      handleEditReport,
      handleRemoveReport,
    }));

  return (
    <CoreTable
      condition={props.isLoaded}
      columns={columns}
      dataSource={transformRowData(
        props.mineReports,
        props.openEditReportModal,
        props.handleEditReport,
        props.handleRemoveReport
      )}
      tableProps={{
        align: "left",
        pagination: props.isPaginated,
        locale: { emptyText: <NullScreen type="reports" /> },
      }}
    />
  );
};

MineReportTable.propTypes = propTypes;
MineReportTable.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  mineReportCategoryOptionsHash: getMineReportCategoryOptionsHash(state),
});

export default connect(mapStateToProps)(MineReportTable);

import React from "react";
import PropTypes from "prop-types";
import * as Strings from "@common/constants/strings";
import { formatDate, truncateFilename, dateSorter } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import NullScreen from "@/components/common/NullScreen";
import { COLOR } from "@/constants/styles";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { MineReportActions } from "@/components/mine/Reports/MineReportActions";
import LinkButton from "@/components/common/LinkButton";
import CoreTable from "@/components/common/CoreTable";

const { errorRed } = COLOR;

/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  openEditReportModal: PropTypes.func.isRequired,
  handleEditReport: PropTypes.func.isRequired,
  handleRemoveReport: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

const columns = [
  {
    title: "Report Name",
    dataIndex: "report_name",
    key: "report_name",
    sorter: (a, b) => a.report_name.localeCompare(b.report_name),
    render: (text, record) => (
      <div title="Report Name" style={record.isOverdue ? { color: errorRed } : {}}>
        {record.report_name}
      </div>
    ),
  },
  {
    title: "Compliance Year/Period",
    dataIndex: "submission_year",
    key: "submission_year",
    sorter: (a, b) => (a.submission_year > b.submission_year ? -1 : 1),
    render: (text, record) => (
      <div title="Year" style={record.isOverdue ? { color: errorRed } : {}}>
        {record.submission_year}
      </div>
    ),
  },
  {
    title: "Due",
    dataIndex: "due_date",
    key: "due_date",
    sorter: dateSorter("due_date"),
    render: (text, record) => (
      <div title="Due" style={record.isOverdue ? { color: errorRed } : {}}>
        {formatDate(record.due_date) || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "Requested By",
    dataIndex: "created_by_idir",
    key: "created_by_idir",
    render: (text) => <div title="Requested By">{text}</div>,
  },
  {
    title: "Received",
    dataIndex: "received_date",
    key: "received_date",
    sorter: dateSorter("received_date"),
    render: (text, record) => (
      <div title="Received" style={record.isOverdue ? { color: errorRed } : {}}>
        {formatDate(record.received_date) || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "Documents",
    dataIndex: "documents",
    key: "documents_key",
    render: (text, record) => (
      <div title="Documents" className="cap-col-height">
        {record.report.mine_report_submissions.length > 0 &&
        record.report.mine_report_submissions[record.report.mine_report_submissions.length - 1]
          .documents.length > 0
          ? record.report.mine_report_submissions[
              record.report.mine_report_submissions.length - 1
            ].documents.map((file) => (
              <div key={file.mine_document_guid} title={file.document_name}>
                <LinkButton onClick={() => downloadFileFromDocumentManager(file)}>
                  {truncateFilename(file.document_name)}
                </LinkButton>
              </div>
            ))
          : Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "",
    dataIndex: "record",
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

const transformRowData = (report, openEditReportModal, handleEditReport, handleRemoveReport) => ({
  key: report.report_guid,
  documents_key: `${report.report_guid}_documents`,
  report,
  report_name: report.report_name,
  due_date: report.due_date,
  created_by_idir: report.created_by_idir,
  received_date: report.received_date,
  submission_year: report.submission_year,
  openEditReportModal,
  handleEditReport,
  handleRemoveReport,
});

export const MineReportTable = (props) => (
  <CoreTable
    condition={props.isLoaded}
    columns={columns}
    dataSource={props.mineReports.map((r) =>
      transformRowData(
        r,
        props.openEditReportModal,
        props.handleEditReport,
        props.handleRemoveReport
      )
    )}
    tableProps={{
      align: "left",
      pagination: false,
      locale: { emptyText: <NullScreen type="reports" /> },
    }}
  />
);

MineReportTable.propTypes = propTypes;

export default MineReportTable;

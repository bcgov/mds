/* eslint-disable */

import React from "react";
import { Table, Button } from "antd";
import moment from "moment";
import PropTypes from "prop-types";
import * as Strings from "@/constants/strings";
import { formatDate } from "@/utils/helpers";
import { EDIT_PENCIL } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";
import { truncateFilename } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";

const propTypes = {
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  openEditReportModal: PropTypes.func.isRequired,
  handleEditReport: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

const defaultProps = {};

const columns = [
  {
    title: "Report Name",
    dataIndex: "report_name",
    key: "report_name",
    sorter: (a, b) => a.report_name.localeCompare(b.report_name),
    render: (text, record) => (
      <div title="Report Name" className={record.isOverdue ? "color-error" : ""}>
        {record.report_name}
      </div>
    ),
  },
  {
    title: "Compliance Period",
    dataIndex: "submission_year",
    key: "submission_year",
    sorter: (a, b) => (a.submission_year > b.submission_year ? -1 : 1),
    render: (text, record) => (
      <div title="Compliance Period" className={record.isOverdue ? "color-error" : ""}>
        {record.submission_year}
      </div>
    ),
  },
  {
    title: "Due",
    dataIndex: "due_date",
    key: "due_date",
    //FIXME sorter: (a, b) => (moment(a.due_date) > moment(b.due_date) ? -1 : 1),
    render: (due_date, record) => (
      <div title="Due" className={record.isOverdue ? "color-error" : ""}>
        {formatDate(due_date) || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "Submitted On",
    dataIndex: "received_date",
    key: "received_date",
    //FIXME sorter: (a, b) =>
    //  moment(a.received_date) > moment(b.received_date) ? -1 : 1,
    render: (received_date, record) => (
      <div title="Submitted On" className={record.isOverdue ? "color-error" : ""}>
        {formatDate(received_date) || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "Requested By",
    dataIndex: "created_by_idir",
    key: "created_by_idir",
    sorter: (a, b) => a.created_by_idir.localeCompare(b.created_by_idir),
    render: (text, record) => (
      <div title="Requested By" className={record.isOverdue ? "color-error" : ""}>
        {text || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "Documents",
    dataIndex: "mine_report_submissions",
    key: "mine_report_submissions",
    render: (text, record) => {
      return (
        <div
          title="Documents"
          className={record.isOverdue ? "color-error cap-col-height" : "cap-col-height"}
        >
          {text.map((sub) =>
            sub.documents.map((doc) => (
              <div>
                -{" "}
                <LinkButton
                  key={doc.mine_document_guid}
                  onClick={() => downloadFileFromDocumentManager(doc)}
                  title={doc.document_name}
                >
                  {truncateFilename(doc.document_name)}
                </LinkButton>
              </div>
            ))
          ) || Strings.EMPTY_FIELD}
        </div>
      );
    },
  },
  {
    title: "",
    dataIndex: "report",
    render: (text, record) => {
      return (
        <div title="" align="right">
          <Button type="link" onClick={(event) => record.openEditReportModal(event, text)}>
            <img src={EDIT_PENCIL} alt="Edit" />
          </Button>
        </div>
      );
    },
  },
];

const transformRowData = (report, openEditReportModal, handleEditReport, handleRemoveReport) => ({
  key: report.report_guid,
  report,
  ...report,
  openEditReportModal,
  handleEditReport,
  handleRemoveReport,
});

export const ReportsTable = (props) => {
  return (
    <Table
      size="small"
      pagination={false}
      loading={!props.isLoaded}
      columns={columns}
      locale={{ emptyText: "This mine has no report data." }}
      dataSource={props.mineReports.map((record) =>
        transformRowData(
          record,
          props.openEditReportModal,
          props.handleEditReport,
          props.handleRemoveReport
        )
      )}
    />
  );
};

ReportsTable.propTypes = propTypes;
ReportsTable.defaultProps = defaultProps;

export default ReportsTable;

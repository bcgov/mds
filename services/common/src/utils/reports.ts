// functions commonly used by reports

import { MINE_REPORT_STATUS_HASH, MINE_REPORT_SUBMISSION_CODES } from "../constants";
import { IMineReport } from "../interfaces";

// values that antd understands
export const reportStatusSeverityForDisplay = (status: MINE_REPORT_SUBMISSION_CODES) => {
  switch (status) {
    case MINE_REPORT_SUBMISSION_CODES.REQ:
      return "error";
    case MINE_REPORT_SUBMISSION_CODES.ACC:
      return "success";
    case MINE_REPORT_SUBMISSION_CODES.REC:
      return "warning";
    case MINE_REPORT_SUBMISSION_CODES.NRQ:
      return "info";
    case MINE_REPORT_SUBMISSION_CODES.INI:
      return "info";
    default:
      return "info";
  }
};

// makes the report status & submission at the top level of the object
export const transformReportData = (report: IMineReport) => {
  const submissionCount = report?.mine_report_submissions?.length ?? 0;
  if (submissionCount > 0) {
    const latestSubmission = report.mine_report_submissions[submissionCount - 1];

    const { mine_report_submission_status_code, submission_date } = latestSubmission;
    return {
      ...report,
      mine_report_submission_status_code,
      status: MINE_REPORT_STATUS_HASH[mine_report_submission_status_code],
      submission_date,
    };
  }
  return {
    ...report,
    status: "",
    mine_report_submission_status_code: "",
    submission_date: "",
    submitter_name: "",
  };
};

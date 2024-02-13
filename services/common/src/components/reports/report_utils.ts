// functions commonly used by reports

import { MINE_REPORT_SUBMISSION_CODES } from "../../constants";

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

// functions commonly used by reports

import { MINE_REPORT_SUBMISSION_CODES } from "@mds/common/constants/enums";
import { MineReportParams } from "@mds/common/interfaces/reports";
import * as Strings from "@mds/common/constants/strings";
import moment from "moment";
import { isEmpty } from "lodash";


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

export const handleFiltering = (reports, params: MineReportParams, mineReportDefinitionOptions, mine_reports_type, isCore) => {
  const reportDefinitionGuids = params.report_type
    ? mineReportDefinitionOptions
      .filter((option) =>
        option.categories
          .map((category) => category.mine_report_category)
          .includes(params.report_type)
      )
      .map((definition) => definition.mine_report_definition_guid)
    : mineReportDefinitionOptions.map((definition) => definition.mine_report_definition_guid);

  let report_type: boolean;

  return reports.filter((report) => {
    if (isCore) {
      if (mine_reports_type === "CRR") {
        report_type =
          !params.report_type || reportDefinitionGuids.includes(report.mine_report_definition_guid);
      } else {
        report_type =
          !params.report_type || report.permit_condition_category_code === params.report_type;
      }
    } else {
      report_type =
        !params.report_type ||
        reportDefinitionGuids.includes(report.mine_report_definition_guid) ||
        report.permit_condition_category_code === params.report_type;
    }

    const report_name =
      !params.report_name || report.mine_report_definition_guid === params.report_name;
    const compliance_year =
      !params.compliance_year ||
      Number(report.submission_year) === Number(params.compliance_year);
    const due_date_start =
      !params.due_date_start ||
      moment(report.due_date, Strings.DATE_FORMAT) >=
      moment(params.due_date_start, Strings.DATE_FORMAT);
    const due_date_end =
      !params.due_date_end ||
      moment(report.due_date, Strings.DATE_FORMAT) <=
      moment(params.due_date_end, Strings.DATE_FORMAT);
    const received_date_start =
      !params.received_date_start ||
      moment(report.received_date, Strings.DATE_FORMAT) >=
      moment(params.received_date_start, Strings.DATE_FORMAT);
    const received_date_end =
      !params.received_date_end ||
      moment(report.received_date, Strings.DATE_FORMAT) <=
      moment(params.received_date_end, Strings.DATE_FORMAT);
    const requested_by =
      !params.requested_by ||
      report.created_by_idir.toLowerCase().includes(params.requested_by.toLowerCase());
    const received_only =
      !params.received_only || params.received_only === "false" || report.received_date;
    const status =
      isEmpty(params.status) || params.status.includes(report.mine_report_status_code);
    return (
      report_name &&
      report_type &&
      compliance_year &&
      due_date_start &&
      due_date_end &&
      received_date_start &&
      received_date_end &&
      received_only &&
      requested_by &&
      status
    );
  });
};

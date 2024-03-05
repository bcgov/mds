import { IMineReportSubmission } from "@mds/common/interfaces/reports/mineReportSubmission.interface";
import { IMineReportContact } from "./mineReportContact.interface";
import { MINE_REPORT_SUBMISSION_CODES } from "../..";

export interface IMineReport {
  mine_report_id: string;
  mine_report_guid: string;
  mine_report_definition_guid: string;
  mine_report_category: string[];
  report_name: string;
  due_date: string;
  received_date: string;
  submission_year: number;
  created_by_idir: string;
  permit_guid: string;
  mine_report_submissions: IMineReportSubmission[];
  mine_report_contacts: IMineReportContact[];
  mine_guid: string;
  mine_name: string;
  submitter_name: string;
  submitter_email: string;
  mine_report_status_code: MINE_REPORT_SUBMISSION_CODES;
}

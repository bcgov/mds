import { IMineReportSubmission } from "@mds/common/interfaces/mine/mineReportSubmission.interface";

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
  mine_guid: string;
  mine_name: string;
}

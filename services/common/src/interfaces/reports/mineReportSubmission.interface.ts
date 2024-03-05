import { IMineDocument } from "@mds/common/interfaces";
import { MINE_REPORT_SUBMISSION_CODES } from "@mds/common/constants";

export interface IMineReportSubmission {
  comments: any[];
  create_timestamp: string;
  create_user: string;
  description_comment: string;
  documents: IMineDocument[];
  due_date: string;
  mine_guid: string;
  mine_name: string;
  mine_report_category: string[];
  mine_report_contacts: any[];
  mine_report_definition_guid: string;
  mine_report_guid: string;
  mine_report_id: string;
  mine_report_submission_guid: string;
  mine_report_submission_status_code: MINE_REPORT_SUBMISSION_CODES;
  status?: string;
  permit_condition_category_code?: any;
  permit_guid?: string;
  permit_number?: any;
  received_date: string;
  report_name?: string;
  report_type?: string;
  report_for?: string;
  submission_date: string;
  submission_year: number;
  submitter_email: string;
  submitter_name: string;
  update_timestamp: string;
  update_user: string;
}

export interface IUpdateMineReportSubmissionStatus {
  mine_report_submission_guid: string;
  mine_report_submission_status_code: MINE_REPORT_SUBMISSION_CODES;
}

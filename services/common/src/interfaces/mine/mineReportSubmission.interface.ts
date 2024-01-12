import { IDocument } from "@mds/common/interfaces";
import { MINE_REPORT_SUBMISSION_CODES } from "@mds/common/constants";

export interface IMineReportSubmission {
  submission_date: string;
  submitter_name?: string;
  documents: IDocument[];
  mine_report_submission_guid: string;
  mine_report_submission_status_code: MINE_REPORT_SUBMISSION_CODES;
}

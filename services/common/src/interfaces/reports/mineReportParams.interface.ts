export interface MineReportParams {
  id?: string;
  report_name: string;
  report_type: string;
  compliance_year: string;
  due_date_start: string;
  due_date_end: string;
  received_date_start: string;
  received_date_end: string;
  received_only: string;
  requested_by: string;
  status: string[];
  sort_field: string;
  sort_dir: string;
  mine_reports_type: string;
  permit_guid?: string;
}

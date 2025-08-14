export interface IMineReportPermitRequirement {
  report_name: string;
  mine_report_permit_requirement_id: number;
  cim_or_cpo: string;
  ministry_recipient: string[];
  permit_condition_ids: number[];
  due_date_period_months: number;
  initial_due_date: string;
  permit_amendment_id?: number;
}

export interface IMineReportPermitRequirement {
  mine_report_permit_requirement_id: number;
  cim_or_cpo: string;
  ministry_recipient: string[];
  permit_condition_id: number;
  due_date_period_months: number;
}

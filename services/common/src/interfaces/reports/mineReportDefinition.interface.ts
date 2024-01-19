import { IComplianceArticle } from "@mds/common/interfaces";

export interface IMineReportDefinitionCategory {
  active_ind: boolean;
  mine_report_category: string;
  description: string;
}

export interface IMineReportDefinition {
  active_ind: boolean;
  categories: IMineReportDefinitionCategory[];
  compliance_articles: IComplianceArticle[];
  default_due_date?: number;
  description: string;
  due_date_period_months?: number;
  is_common: boolean;
  mine_report_definition_guid: string;
  mine_report_due_date_type: string;
  report_name: string;
}

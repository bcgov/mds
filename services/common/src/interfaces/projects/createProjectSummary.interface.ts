import { IProjectSummaryAuthorization } from "@/index";

export interface ICreateProjectSummary {
  authorizations: IProjectSummaryAuthorization[];
  project_summary_description: string;
  project_summary_title: string;
  status_code: string;
}

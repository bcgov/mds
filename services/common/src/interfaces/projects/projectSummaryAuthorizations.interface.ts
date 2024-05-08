import { IProjectSummaryDocument } from "./projectSummaryDocuments.interface";

export interface IProjectSummaryAuthorization {
  project_summary_authorization_guid: string;
  project_summary_guid: string;
  project_summary_permit_type: string[];
  project_summary_authorization_type: string;
  existing_permits_authorizations: string[];
  amendment_changes: string[];
  amendment_severity: string;
  authorization_description: string;
  exemption_requested: boolean;
  is_contaminated: boolean;
  new_type: string;
  amendment_documents: IProjectSummaryDocument[];
}

import { IMineDocument } from "@mds/common/index";

export interface IProjectSummaryDocument extends IMineDocument {
  user_id?: string;
  keycloak_guid?: string;
  email_or_username?: string;
  mines?: string[];
  project_summary_id: number;
  project_summary_document_type_code: string;
}

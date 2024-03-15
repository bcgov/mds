import {
  IProjectSummaryDocument,
  IProjectContact,
  IProjectSummaryAuthorization,
  IParty,
} from "@mds/common/index";

export interface IProjectSummary {
  project_guid: string;
  project_summary_id: number;
  project_summary_guid: string;
  project_summary_title: string;
  project_summary_description: string;
  mine_guid: string;
  mine_name: string;
  status_code: string;
  proponent_project_id?: string;
  expected_draft_irt_submission_date?: string;
  submission_date: string;
  expected_permit_application_date?: string;
  expected_permit_receipt_date?: string;
  expected_project_start_date?: string;
  documents: Partial<IProjectSummaryDocument>[];
  contacts: IProjectContact[];
  authorizations: IProjectSummaryAuthorization[];
  update_user: string;
  update_timestamp: string;
  create_user: string;
  create_timestamp: string;
  mrc_review_required?: boolean;
  project_lead_party_guid?: string;
  agent?: IParty;
}

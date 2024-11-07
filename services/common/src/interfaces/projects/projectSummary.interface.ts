import {
  IProjectSummaryDocument,
  IProjectContact,
  IProjectSummaryAuthorization,
  IParty,
  IMineDocument,
} from "@mds/common/index";

export interface ICredentialedParty extends IParty {
  credential_id: string;
}

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
  documents: IProjectSummaryDocument[];
  contacts: IProjectContact[];
  authorizations: IProjectSummaryAuthorization[];
  update_user: string;
  update_timestamp: string;
  create_user: string;
  create_timestamp: string;
  mrc_review_required?: boolean;
  project_lead_party_guid?: string;
  agent?: ICredentialedParty;
  is_historic: boolean;
  authorizationTypes?: string[];
}

interface IProjectSummaryFormAuthorizations extends IProjectSummaryAuthorization {
  AMENDMENT: IProjectSummaryAuthorization[];
  NEW: IProjectSummaryAuthorization[];
  types: string[];
}

// properties that exist on the form but otherwise do not exist
export interface IProjectSummaryForm extends Omit<IProjectSummary, "authorizations"> {
  authorizations: IProjectSummaryFormAuthorizations;
  is_agent: boolean;
  applicant: any;
  is_legal_address_same_as_mailing_address: boolean;
  is_billing_address_same_as_mailing_address: boolean;
  is_billing_address_same_as_legal_address: boolean;
  spatial_documents: IMineDocument[];
  support_documents: IMineDocument[];
  payment_contact: IParty;
  is_legal_land_owner: boolean;
  facility_coords_source: string;
  facility_latitude: string;
  facility_longitude: string;
  legal_land_desc: string;
  facility_pid_pin_crown_file_no: string;
  zoning: boolean;
}
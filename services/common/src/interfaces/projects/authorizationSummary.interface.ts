export interface IAuthorizationSummary {
  type: string;
  permit_no: string;
  ams_tracking_number?: string;
  status?: string;
  date_submitted?: string;
  project_summary_authorization_guid?: string;
}

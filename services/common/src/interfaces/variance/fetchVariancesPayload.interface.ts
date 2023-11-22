export interface IFetchVariancesPayload {
  page: string;
  per_page: string;
  variance_application_status_code: string;
  compliance_codes: string;
  major: string;
  region: string;
  sort_field: string;
  sort_dir: string;
  issue_date_before: string;
  issue_date_after: string;
  expiry_date_before: string;
  expiry_date_after: string;
}

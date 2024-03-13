export interface IMineStatus {
  mine_status_guid: string;
  mine_guid: string;
  mine_status_xref_guid: string;
  status_values: string[];
  status_labels: string[];
  effective_date: string;
  expiry_date?: string;
  status_date?: string;
  status_description: string;
}

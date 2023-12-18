import { IMineIncidentDocument } from "@mds/common/interfaces/incidents/mineIncidentDocument.interface";

export interface IMineIncidentCategory {
  mine_incident_category_code: string;
}

export interface IMineIncident {
  incident_location: string;
  mine_name: string;
  mine_guid: string;
  categories: IMineIncidentCategory[];
  incident_timestamp: string;
  mine_incident_guid: string;
  documents: IMineIncidentDocument[];
  status_code: string;
  responsible_inspector_party: string;
  update_user: string;
  update_timestamp: string;
  mine_incident_report_no: string;
}

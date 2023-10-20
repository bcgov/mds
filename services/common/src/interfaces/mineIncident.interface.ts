export interface IMineIncidentCategory {
  mine_incident_category_code: string;
}

export interface IMineIncident {
  mine_name: string;
  categories: IMineIncidentCategory[];
  incident_timestamp: string;
  mine_incident_guid: string;
}

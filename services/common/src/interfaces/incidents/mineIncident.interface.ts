import { IMineIncidentDocument } from "@mds/common/interfaces/incidents/mineIncidentDocument.interface";

export interface IMineIncidentCategory {
  mine_incident_category_code: string;
}

export interface IMineIncident {
  emergency_services_called: boolean;
  determination_type_code: string;
  followup_inspection: boolean;
  followup_inspection_date: string;
  followup_investigation_type_code: string;
  incident_description: string;
  mine_incident_id_year: number;
  mine_incident_no: number;
  number_of_fatalities: number;
  number_of_injuries: number;
  proponent_incident_no: string;
  recommendations: string[];
  reported_by_email: string;
  reported_by_name: string;
  reported_by_phone_ext: string;
  reported_by_phone_no: string;
  reported_timestamp: string;
  verbal_notification_provided: boolean;
  reported_to_inspector_party_guid: string;
  responsible_inspector_party_guid: string;
  mms_inspector_initials: string;
  determination_inspector_party_guid: string;
  dangerous_occurrence_subparagraph_ids: string[] | number[];
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

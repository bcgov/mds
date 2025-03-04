import { IMineIncident } from "./mineIncident.interface";
import { IMineIncidentDocument } from "./mineIncidentDocument.interface";

export interface IMineIncidentForm extends IMineIncident {
  initial_incident_documents: IMineIncidentDocument[],
  final_report_documents: IMineIncidentDocument[],
  internal_ministry_documents: IMineIncidentDocument[]
}

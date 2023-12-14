import { MINE_INCIDENT_DOCUMENT_TYPE_CODE } from "@mds/common/constants/enums";

export interface IMineIncidentDocument {
  mine_document_guid: string;
  document_manager_guid: string;
  document_name: string;
  mine_incident_document_type_code: MINE_INCIDENT_DOCUMENT_TYPE_CODE;
  upload_date: string;
  update_user: string;
}

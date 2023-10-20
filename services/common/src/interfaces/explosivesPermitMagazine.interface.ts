import { IMineDocument } from "./mineDocument.interface";

export interface IExplosivesPermitMagazine {
  explosives_permit_magazine_id: number;
  explosives_permit_id: number;
  explosives_permit_magazine_type_code: string;
  type_no: string;
  tag_no: string;
  construction: string;
  latitude: number;
  longitude: number;
  length: number;
  width: number;
  height: number;
  quantity: number;
  distance_road: number;
  distance_dwelling: number;
  detonator_type: string;
}

export interface IExplosivesPermitDocument extends IMineDocument {
  explosives_permit_id: number;
  explosives_permit_document_type_code: string;
}

export interface IExplosivesPermit {
  explosives_permit_id: number;
  explosives_permit_guid: string;
  mine_guid: string;
  permit_guid: string;
  now_application_guid: string;
  issuing_inspector_party_guid: string;
  issuing_inspector_name: string;
  mine_manager_mine_party_appt_id: number;
  permittee_mine_party_appt_id: number;
  mine_manager_name: string;
  permittee_name: string;
  application_status: string;
  permit_number: string;
  issue_date: string;
  expiry_date: string;
  application_number: string;
  application_date: string;
  originating_system: string;
  received_timestamp: string;
  decision_timestamp: string;
  decision_reason: string;
  latitude: number;
  longitude: number;
  is_closed: boolean;
  closed_timestamp: string;
  closed_reason: string;
  total_detonator_quantity: number;
  total_explosive_quantity: number;
  description: string;
  explosive_magazines: IExplosivesPermitMagazine[];
  detonator_magazines: IExplosivesPermitMagazine[];
  documents: IExplosivesPermitDocument[];
  mines_permit_number: string;
  now_number: string;
}

export interface IExplosivesPermitStatus {
  explosives_permit_status_code: string;
  description: string;
  active_ind: boolean;
  display_order: number;
}

export interface IExplosivesPermitDocumentType {
  explosives_permit_document_type_code: string;
  description: string;
  active_ind: boolean;
  display_order: number;
  document_template: IDocumentTemplate;
}

export interface IExplosivesPermitMagazineType {
  explosives_permit_magazine_type_code: string;
  description: string;
}

export interface IDocumentTemplateField {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  "context-value": string;
  "read-only": boolean;
}

export interface IDocumentTemplate {
  document_template_code: string;
  form_spec: IDocumentTemplateField[];
}

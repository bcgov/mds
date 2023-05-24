import { IMagazine } from "@/index";

export interface IExplosivesPermit {
  explosives_permit_id: number;
  explosives_permit_guid: string;
  mine_guid: string;
  permit_guid: string;
  now_application_guid: string;
  issuing_inspector_party_guid: string;
  issuing_inspector_name: string;
  permittee_mine_party_appt_id: number;
  permittee_name: string;
  mine_manager_mine_party_appt_id: number;
  mine_manager_name: string;
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
  explosive_magazines: IMagazine[];
  detonator_magazines: IMagazine[];
  documents: any[];
  mines_permit_number: string;
  now_number: string;
}

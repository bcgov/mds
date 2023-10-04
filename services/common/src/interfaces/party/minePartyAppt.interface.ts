import { IParty, MinePartyAppointmentTypeCodeEnum } from "@mds/common/index";

export interface IMinePartyAppt {
  documents: string[];
  end_date?: string;
  mine_guid?: string;
  mine_party_acknowledgement_status: string;
  mine_party_appt_guid: string;
  mine_party_appt_type_code: MinePartyAppointmentTypeCodeEnum;
  party_guid: string;
  permit_no?: string;
  related_guid?: string;
  start_date?: string;
  status?: string;
  party: IParty;
  union_rep_company?: string;
}

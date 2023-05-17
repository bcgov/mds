import { IParty } from "@/interfaces/party.interface";

export interface IPartyRelationship {
  mine_party_appt_guid: string;
  mine_guid: string;
  party: IParty;
  mine_party_appt_type_code: string;
  related_guid: string;
  permit_no: string;
  start_date: string;
  end_date: string;
  union_rep_company: string;
}

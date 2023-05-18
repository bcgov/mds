import { IPermitParty } from "@/interfaces/permits/permitParty.interface";

export interface IPermitPartyRelationship {
  mine_party_appt_guid: string;
  mine_guid: string;
  party: IPermitParty;
  mine_party_appt_type_code: string;
  related_guid: string;
  permit_no: string;
  start_date: string;
  end_date: string;
  union_rep_company: string;
}

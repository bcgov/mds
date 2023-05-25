import { MinePartyAppointmentTypeCodeEnum } from "@/index";

export interface ICreateParty {
  end_current: boolean;
  party_guid: string;
  mine_party_appt_type_code: MinePartyAppointmentTypeCodeEnum;
  related_guid: string;
  mine_guid: string;
  start_date: string;
  end_date?: string;
  union_rep_company?: string;
}

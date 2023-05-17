import { IParty, MinePartyAppointmentTypeCodeEnum } from "@/index";

export interface ICreateTSFParty {
  end_current: boolean;
  end_date?: string;
  mine_guid: string;
  mine_party_appt_type_code: MinePartyAppointmentTypeCodeEnum;
  party_guid: string;
  related_guid: string;
  start_date: string;
}

export interface ITSFParty extends ICreateTSFParty {
  mine_party_appt_guid: string;
  party: IParty;
  update_timestamp?: string;
}

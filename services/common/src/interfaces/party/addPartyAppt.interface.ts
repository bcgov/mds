import { MinePartyAppointmentTypeCodeEnum } from "@/index";

export interface IAddPartyAppointment {
  mine_guid: string;
  party_guid: string;
  mine_party_appt_type_code: MinePartyAppointmentTypeCodeEnum;
  related_guid: string;
  start_date: string;
  end_date?: string;
  end_current?: boolean;
}

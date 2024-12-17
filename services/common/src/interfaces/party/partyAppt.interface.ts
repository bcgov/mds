import { IAddPartyAppointment, IParty } from "@mds/common/interfaces";

export interface IPartyAppt extends IAddPartyAppointment {
  mine_party_appt_guid: string;
  update_timestamp?: string;
  party: IParty;
}

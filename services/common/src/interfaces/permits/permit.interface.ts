import { IPermitBond } from "@mds/common/interfaces/permits/permitBond.interface";
import { IMineType } from "@mds/common/interfaces/mineType.interface";
import { IPermitAmendment } from "@mds/common/interfaces/permits/permitAmendment.interface";
import { VC_CONNECTION_STATES } from "../..";

export interface IPermit {
  permit_id: string;
  permit_guid: string;
  permit_no: string;
  permit_status_code: string;
  current_permittee: string;
  current_permittee_digital_wallet_connection_state: VC_CONNECTION_STATES;
  current_permittee_guid: string;
  project_id: string;
  permit_amendments: IPermitAmendment[];
  remaining_static_liability: number;
  assessed_liability_total: number;
  confiscated_bond_total: number;
  active_bond_total: number;
  bonds: IPermitBond[];
  exemption_fee_status_code: string;
  exemption_fee_status_note: string;
  site_properties: IMineType;
  permit_prefix: string;
  mine_guid?: string;
}

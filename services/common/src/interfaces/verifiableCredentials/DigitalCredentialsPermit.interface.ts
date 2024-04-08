import { IPermit } from "@mds/common/interfaces";

export interface DigitalCredentialPermit extends IPermit {
  mine_operation_status?: string;
  mine_operation_status_reason?: string;
  mine_operation_status_sub_reason?: string;
  mine_disturbance: string;
  mine_commodity: string;
  mine_no: string;
  issue_date: string;
  latitude: number;
  longitude: number;
  bond_total: string;
  tsf_operating_count: string;
  tsf_care_and_maintenance_count: string;
}

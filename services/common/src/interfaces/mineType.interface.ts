import { IMineTypeDetail } from "@mds/common/index";

export interface IMineType {
  mine_type_guid: string;
  mine_guid: string;
  permit_guid: string | null;
  now_application_guid: string | null;
  mine_tenure_type_code: string;
  mine_type_detail: IMineTypeDetail[];
  mine_commodity_code?: string[];
  mine_disturbance_code?: string[];
}

import { IMineTypeDetail } from "@/interfaces/mineTypeDetail.interface";

export interface IMineType {
  mine_type_guid: string;
  mine_guid: string;
  permit_guid: string;
  now_application_guid: string;
  mine_tenure_type_code: string;
  mine_type_detail: IMineTypeDetail[];
}

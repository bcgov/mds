import {
  IMineType,
  IMineVerifiedStatus,
  IMineWorkInformation,
  ITailingsStorageFacility,
} from "@/index";

export interface IMine {
  mine_guid: string;
  mine_no: string;
  mine_name: string;
  mine_note: string;
  mine_region: string;
  ohsc_ind: boolean;
  union_ind: boolean;
  major_mine_ind: boolean;
  mine_permit_numbers: string[];
  mine_tailings_storage_facilities: ITailingsStorageFacility[];
  number_of_mine_employees: number;
  number_of_contractors: number;
  mine_type: IMineType[];
  verified_status: IMineVerifiedStatus;
  has_minespace_users: boolean;
  mms_alias: string;
  mine_work_information: IMineWorkInformation[];
}

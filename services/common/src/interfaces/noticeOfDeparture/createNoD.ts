import { NoDStatusDisplayEnum, NoDTypeSaveEnum } from "@/constants";

export interface ICreateNoD {
  nod_title: string;
  mine_guid: string;
  permit_guid: string;
  nod_description: string;
  nod_type: NoDTypeSaveEnum;
  nod_status: NoDStatusDisplayEnum;
  nod_contacts: string[];
}

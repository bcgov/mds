import { NoDStatusDisplayEnum, NoDTypeSaveEnum } from "@/constants";
import { IMine } from "@/interfaces/mine.interface";
import { IPermit } from "@/interfaces/permit.interface";
import { INoDDocument } from "@/interfaces";

export interface INoticeOfDeparture {
  nod_guid: string;
  nod_no: string;
  nod_title: string;
  nod_description: string;
  nod_type: NoDTypeSaveEnum;
  nod_status: NoDStatusDisplayEnum;
  create_timestamp: string;
  mine: IMine;
  documents: INoDDocument[];
  permit: IPermit;
  submission_timestamp: string;
  updated_timestamp: string;
}

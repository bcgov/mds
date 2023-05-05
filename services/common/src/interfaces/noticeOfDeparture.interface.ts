import { NoDStatusEnum, NoDTypeEnum } from "@/constants";
import { IMine } from "@/interfaces/mine.interface";
import { IPermit } from "@/interfaces/permit.interface";

export interface INoticeOfDeparture {
  nod_guid: string;
  nod_no: string;
  nod_title: string;
  nod_description: string;
  nod_type: NoDTypeEnum;
  nod_status: NoDStatusEnum;
  create_timestamp: string;
  mine: IMine;
  documents: any[];
  permit: IPermit;
  submission_timestamp: string;
  updated_timestamp: string;
}

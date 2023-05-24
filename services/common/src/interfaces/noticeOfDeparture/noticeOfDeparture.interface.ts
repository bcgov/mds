import { NoDStatusDisplayEnum, NoDTypeSaveEnum } from "@/constants";
import { IMine } from "@/interfaces/mine.interface";
import { INoDPermit, INoDDocument } from "@/index";

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
  permit: INoDPermit;
  submission_timestamp: string;
  updated_timestamp: string;
}

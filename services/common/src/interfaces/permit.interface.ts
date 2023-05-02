import { IAmendment } from "@/interfaces/amendment.interface";

export interface IPermit {
  permit_guid: string;
  permit_no: string;
  mine_guid: string;
  permit_status_code: string;
  amendments: IAmendment[];
}

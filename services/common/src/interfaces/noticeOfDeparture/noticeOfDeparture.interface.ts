import { INoDPermit, INoDDocument, INoDContactInterface } from "@mds/common/interfaces";
import { NoDStatusDisplayEnum, NodStatusSaveEnum, NoDTypeSaveEnum } from "@mds/common/constants/enums";

export interface INoticeOfDeparture {
  nod_guid: string;
  nod_no: string;
  nod_title: string;
  nod_description: string;
  nod_type: NoDTypeSaveEnum;
  nod_status: NoDStatusDisplayEnum | NodStatusSaveEnum;
  create_timestamp: string;
  mine: {
    mine_guid: string;
    mine_no: string;
    mine_name: string;
  };
  documents: INoDDocument[];
  permit: Partial<INoDPermit>;
  submission_timestamp: string;
  update_timestamp: string;
  nod_contacts?: INoDContactInterface[];
}

import { IMine } from "@mds/common/interfaces/mine.interface";
import { INoDPermit, INoDDocument } from "@mds/common/interfaces";
import { NoDStatusDisplayEnum, NodStatusSaveEnum, NoDTypeSaveEnum } from "@mds/common/constants/enums";

export interface INoticeOfDeparture {
  nod_guid: string;
  nod_no: string;
  nod_title: string;
  nod_description: string;
  nod_type: NoDTypeSaveEnum;
  nod_status: NoDStatusDisplayEnum | NodStatusSaveEnum;
  create_timestamp: string;
  mine: IMine;
  documents: INoDDocument[];
  permit: Partial<INoDPermit>;
  submission_timestamp: string;
  update_timestamp: string;
  mine_manager_name: string;

  // TODO: This needs a type.
  nod_contacts?: any[];
}

import { IMine } from "@mds/common/index";

export interface IPatchPermitNumber {
  permit_guid: string;
  mine: Partial<IMine>[];
  permit_no: string;
  current_permitte: string;
}

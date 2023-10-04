import { IAmendment } from "@mds/common/index";

export interface INoDPermit {
  permit_guid: string;
  permit_no: string;
  mine_guid: string;
  permit_status_code: string;
  amendments: IAmendment[];
}

import { IPermitAmendment } from "@/index";

export interface IDraftPermitAmendment {
  permit_guid: string;
  permit_no: string;
  permit_status_code: string;
  amendments: Partial<IPermitAmendment>[];
  current_permittee: string;
}

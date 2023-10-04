import { IPermitAmendment, IPermitUploadedFile } from "@mds/common/index";

export interface ICreatePermitAmendmentPayload {
  mine_guid: string;
  permit_guid: string;
  amendments: IPermitAmendment[];
  permit_prefix: string;
  permittee_party_guid: string;
  issue_date: string;
  authorization_end_date: string;
  description: string;
  liability_adjustment: number;
  security_received_date: string;
  security_not_required: boolean;
  security_not_required_reason: string;
  uploadedFiles: IPermitUploadedFile[];
}

import { ICreatePermitSiteProperties } from "@/interfaces/permits/createPermitSiteProperties.interface";
import { IPermitUploadedFile } from "@/interfaces/permits/permitUploadedFile.interface";

export interface ICreatePermitPayload {
  permittee_party_guid: string;
  permit_type: string;
  is_exploration: boolean;
  permit_no: string;
  permit_status_code: string;
  issue_date: string;
  authorization_end_date?: string;
  liability_adjustment: number;
  security_received_date: string;
  security_not_required?: boolean;
  security_not_required_reason?: string;
  site_properties: ICreatePermitSiteProperties;
  exemption_fee_status_code: string;
  exemption_fee_status_note?: string;
  uploadedFiles?: IPermitUploadedFile[];
}

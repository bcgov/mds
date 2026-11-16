import { VC_CRED_ISSUE_STATES } from "@mds/common/constants/enums";
import { IMineDocument } from "../mineDocument.interface";
import { INoWDocument } from "../NoWDocument.interface";
import { INoWImportedApplicationDocument } from "../NoWImportedApplicationDocument.interface";
import { IMineReportPermitRequirement } from "./mineReportPermitRequirements.interface";
import { IPermitAmendmentDocument } from "./permitAmendmentDocument.interface";
import { IPermitCondition, IPermitConditionCategory } from "./permitCondition.interface";

// A permit package file in issued permit order, with the reference used in the issued permit (e.g. "Figure 1, Site Plan")
export interface IPermitPackageFile {
  now_application_document_xref_guid: string;
  permit_package_document_type_code: "FIGURE" | "DOCUMENT";
  order_label: string;
  title: string;
  reference: string;
  label: string;
  mine_document: IMineDocument;
}

export interface IActiveOrgbookPublishStatus {
  unsigned_payload_hash: string;
  permit_amendment_guid: string;
  party_guid: string;
  publish_state: boolean | null;
  permit_number: string;
  orgbook_entity_id: string;
  orgbook_credential_id: string | null;
  revoked_ind: boolean;
  revoked_reason: string | null;
  error_msg?: string | null;
  create_timestamp: string;
  update_timestamp: string;
}

export interface IPermitAmendment {
  permit_amendment_id: number;
  permit_no: string;
  permit_amendment_guid: string;
  permit_amendment_status_code: string;
  permit_amendment_type_code: string;
  received_date: string;
  issue_date: string;
  authorization_end_date: string;
  liability_adjustment: number;
  security_received_date: string;
  security_not_required: boolean;
  security_not_required_reason: string;
  description: string;
  issuing_inspector_title: string;
  regional_office: string;
  now_application_guid: string;
  now_application_documents: INoWDocument[];
  imported_now_application_documents: INoWImportedApplicationDocument[];
  permit_package_files: IPermitPackageFile[];
  related_documents: IPermitAmendmentDocument[];
  permit_conditions_last_updated_by: string;
  permit_conditions_last_updated_date: string;
  has_permit_conditions: boolean;
  conditions: IPermitCondition[];
  is_generated_in_core: boolean;
  preamble_text: string;
  vc_credential_exch_state: VC_CRED_ISSUE_STATES;
  active_orgbook_publish_status?: IActiveOrgbookPublishStatus;
  mine_report_permit_requirements?: IMineReportPermitRequirement[];
  condition_categories: IPermitConditionCategory[];
  conditions_review_completed: boolean;
}

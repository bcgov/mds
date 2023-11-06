import {
  INoWDocument,
  IPermitAmendmentDocument,
  INoWImportedApplicationDocument,
  IPermitCondition,
  VC_CRED_ISSUE_STATES,
} from "@mds/common/index";

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
  related_documents: IPermitAmendmentDocument[];
  permit_conditions_last_updated_by: string;
  permit_conditions_last_updated_date: string;
  has_permit_conditions: boolean;
  conditions: IPermitCondition[];
  is_generated_in_core: boolean;
  preamble_text: string;
  vc_credential_exch_state: VC_CRED_ISSUE_STATES;
}

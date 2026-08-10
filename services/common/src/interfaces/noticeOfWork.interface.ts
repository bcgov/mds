import { ICreatePermitSiteProperties, IimportedNOWApplication, IMineDocument, INoticeOfWorkApplicationProgress, INoWDocument, IParty } from "@mds/common/interfaces";

export interface INoticeOfWorkContact {
  type: string;
  org_legalname: string;
  org_doingbusinessas: string;
  ind_firstname: string;
  ind_lastname: string;
  ind_middlename: string;
  ind_phonenumber: string;
  dayphonenumber: string;
  dayphonenumberext: string;
  faxnumber: string;
  email: string;
  org_bcfedincorpnumber: string;
  org_bcregnumber: string;
  org_societynumber: string;
  org_hstregnumber: string;
  org_contactname: string;
  mailingaddressline1: string;
  contacttype: string;
  contactcertificationtype: string;
  contactcertificationid: string;
  mailingaddressline2: string;
  mailingaddresscity: string;
  mailingaddressprovstate: string;
  mailingaddresscountry: string;
  mailingaddresspostalzip: string;
  seq_no: number;
}

export interface INoticeOfWork {
  mine_region: any;
  notice_of_work_type_description: string;
  lead_inspector_name: string;
  issuing_inspector_name: string;
  issuing_inspector_party_guid: string;
  consultation_advisor_party_guid: string;
  now_application_status_description: string;
  received_date: string;
  originating_system: string;
  application_documents: IMineDocument[];
  documents?: INoWDocument[];
  issuing_inspector?: IParty;
  is_historic: boolean;
  imported_to_core: boolean;
  now_application_guid: string;
  lead_inspector_party_guid: string;
  notice_of_work_type_code: string;
  mine_guid: string;
  now_number: string;
  mine_name: string;
  mine_no?: string;
  longitude?: string;
  latitude?: string;
  contacts?: INoticeOfWorkContact[];
  application_progress?: INoticeOfWorkApplicationProgress[];
  now_application_tier_code?: string;
  now_application_tier_description?: string;
  now_application_tier_created_date?: string;
  now_application_tier_updated_date?: string;
  application_type_code?: string;
  now_application_status_code?: string;
}

export interface IConditionSection {
  condition: string;
}

// equivalent to CustomPropTypes permitGenObj, based on real values
export interface INoWGeneratedPermit {
  application_date: string;
  application_last_updated_date: string;
  application_type: string;
  auth_end_date: string;
  conditions: string;
  current_date: string;
  current_month: string;
  current_year: string;
  final_original_documents_metadata: any;
  final_requested_documents_metadata: any;
  formatted_auth_end_date: string;
  formatted_issue_date: string;
  issue_date: string;
  issuing_inspector_title: string;
  lead_inspector: string;
  mine_location: string;
  mine_no: string;
  now_number: string;
  now_tracking_number: number;
  original_permit_issue_date: string;
  permit_amendment_type_code: string;
  permit_number: string;
  permittee: string;
  permittee_email: string;
  permittee_mailing_address: string;
  preamble_text: string;
  previous_amendment_documents_metadata: any;
  property: string;
  proposed_end_date: string;
  proposed_start_date: string;
  proposed_term_of_authorization: string;
  regional_office: string;
  site_property: ICreatePermitSiteProperties;
  term_of_authorization: string;
}

export interface INoWApplicationForm extends Omit<IimportedNOWApplication, "documents"> {
  now_number: string;
  now_tracking_number: number;
  lead_inspector: IParty;
  issuing_inspector: IParty;
  imported_by: string;
  imported_date: string;
  previous_application_status_code: string;
  application_type: string;
  type_of_application: string;
  ats_authorization_number: number;
  ats_project_number: number;
  other_information: string;
  unreclaimed_disturbance_previous_year: string;
  disturbance_planned_reclamation: string;
  original_start_date: string;
  mine_latitude: string;
  mine_longitude: string;
  permittee: IParty | {};
  documents: Array<{
    id?: number;
    messageid?: number;
    documenturl?: string;
    filename?: string;
    documenttype?: string;
    description?: string;
    mine_document_guid?: string;
    document_manager_guid?: string;
    is_final_package?: boolean;
    final_package_order?: number;
    is_referral_package?: boolean;
    preamble_title?: string;
    preamble_author?: string;
    preamble_date?: string;
    now_application_document_sub_type_code?: string;
  }>;
  regional_contact: string;
  submitted_to_core_date: string;
  last_updated_date: string;
  filtered_submission_documents: Array<{
    id?: number;
    messageid?: number;
    documenturl?: string;
    filename?: string;
    documenttype?: string;
    description?: string;
    mine_document_guid?: string;
    document_manager_guid?: string;
    is_final_package?: boolean;
    final_package_order: number;
    is_referral_package?: boolean;
  }>;
}
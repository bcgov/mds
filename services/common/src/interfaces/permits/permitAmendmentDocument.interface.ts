export interface IPermitAmendmentDocument {
  permit_id: number;
  permit_amendment_document_guid: string;
  mine_guid: string;
  document_manager_guid: string;
  document_name: string;
  active_ind: boolean;
  preamble_title: string;
  preamble_author: string;
  preamble_date: string;
}

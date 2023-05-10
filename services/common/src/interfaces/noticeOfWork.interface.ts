export interface INOWApplication {
  noticeOfWork: INOW;
  match: any;
  history: any;
  draftPermit: INOWDraftPermit;
  applicationPageFromRoute: string;
  fixedTop: string;
  mineGuid: string;
  originalNoticeOfWork: string;
  renderTabTitle: any;
}

export interface INOW {
  imported_to_core: boolean;
  now_application_guid: string;
  lead_inspector_party_guid: string;
  notice_of_work_type_code: string;
  mine_guid: string;
}

export interface INOWDraftPermit {
  permit_guid: string;
}

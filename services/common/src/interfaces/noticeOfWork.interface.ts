import { IMineDocument } from "./mineDocument.interface";

export interface INoticeOfWork {
  mine_region: any;
  notice_of_work_type_description: string;
  lead_inspector_name: string;
  issuing_inspector_name: string;
  issuing_inspector_party_guid: string;
  now_application_status_description: string;
  received_date: string;
  originating_system: string;
  application_documents: IMineDocument[];
  is_historic: boolean;
  imported_to_core: boolean;
  now_application_guid: string;
  lead_inspector_party_guid: string;
  notice_of_work_type_code: string;
  mine_guid: string;
  now_number: string;
  mine_name: string;
  mine_no?: string;
}

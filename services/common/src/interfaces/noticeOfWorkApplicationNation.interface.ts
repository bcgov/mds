import { INoticeOfWorkApplicationNationEvent } from "./noticeOfWorkApplicationNationEvent.interface";

export interface INoticeOfWorkApplicationNation {
  now_application_nation_guid: string;
  now_application_nation_id: number;
  now_application_guid: string;
  status?: string;
  events?: INoticeOfWorkApplicationNationEvent[];
  consultation_started_by_client?: boolean;
  due_date?: string;
  contact_organization_name: string;
  organization_guid: string;
  consultation_area_name: string;
  consultation_area_guid: string;
  consultation_area_update_date: string;
  update_user?: string;
  update_timestamp?: string;
  create_user?: string;
  create_timestamp?: string;
}

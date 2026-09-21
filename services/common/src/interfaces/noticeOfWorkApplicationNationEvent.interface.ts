export interface INoticeOfWorkApplicationNationEvent {
  now_application_nation_event_guid: string;
  now_application_nation_guid: string;
  now_application_nation_event_id: number;
  event_name: string;
  event_from: string;
  event_to: string;
  start_date: string;
  end_date?: string;
  update_user?: string;
  update_timestamp?: string;
  create_user?: string;
  create_timestamp?: string;
}
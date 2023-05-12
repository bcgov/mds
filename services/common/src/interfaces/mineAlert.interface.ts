export interface IMineAlert {
  mine_alert_id: number;
  mine_alert_guid: string;
  mine_guid: string;
  start_date: string;
  end_date: string;
  contact_name: string;
  contact_phone: string;
  message: string;
  is_active: boolean;
  create_user: string;
  create_timestamp: string;
  update_user: string;
  update_timestamp: string;
}

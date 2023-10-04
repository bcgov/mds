import { INotificationDocument } from "@mds/common/index";

export interface IActivity {
  notification_guid: string;
  notification_read: boolean;
  notification_recipient: string;
  create_timestamp: string;
  update_timestamp: string;
  notification_document: INotificationDocument;
}

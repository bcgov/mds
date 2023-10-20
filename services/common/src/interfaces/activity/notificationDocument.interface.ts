import { ActivityTypeEnum, INotificationDocumentMetadata } from "@mds/common/index";

export interface INotificationDocument {
  message: string;
  activity_type: ActivityTypeEnum;
  metadata: INotificationDocumentMetadata;
}

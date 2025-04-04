import { ActivityTypeEnum } from "@mds/common/constants/enums";
import { INotificationDocumentMetadata } from "./notificationDocumentMetadata.interface";

export interface INotificationDocument {
  message: string;
  activity_type: ActivityTypeEnum;
  metadata: INotificationDocumentMetadata;
}

import { ActivityTypeEnum, INotificationDocumentMetadata } from "@/index";

export interface INotificationDocument {
  message: string;
  activity_type: ActivityTypeEnum;
  metadata: INotificationDocumentMetadata;
}

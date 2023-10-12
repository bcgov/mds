import {
  INotificationDocumentMine,
  INotificationDocumentPermit,
  INotificationDocumentProject,
  INotificationDocumentMineTailingsStorageFacility,
} from "@mds/common/index";

export interface INotificationDocumentMetadata {
  mine: INotificationDocumentMine;
  entity: string;
  entity_guid: string;
  permit?: INotificationDocumentPermit;
  project?: INotificationDocumentProject;
  mine_tailings_storage_facility?: INotificationDocumentMineTailingsStorageFacility;
}

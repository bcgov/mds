import { IContact } from "@mds/common/index";

export interface IProjectContact extends IContact {
  project_guid?: string;
  project_contact_guid?: string;
}

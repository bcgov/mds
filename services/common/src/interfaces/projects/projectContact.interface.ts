import { IContact } from "./contact.interface";

export interface IProjectContact extends IContact {
  project_guid?: string;
  project_contact_guid?: string;
}

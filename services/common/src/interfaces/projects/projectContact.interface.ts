import { IContact } from "@/index";

export interface IProjectContact extends IContact {
  project_guid?: string;
  project_contact_guid?: string;
}

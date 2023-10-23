import { IContact } from "@mds/common/index";

export interface IProjectSummaryContact extends IContact {
  project_summary_contact_guid?: string;
  project_summary_guid?: string;
}

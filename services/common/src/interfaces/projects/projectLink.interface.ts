import { PROJECT_SUMMARY_STATUS_CODES } from "@mds/common/constants/enums";

interface IProjectLinkContact {
  name: string;
}

interface IProjectLinkSummary {
  status_code: PROJECT_SUMMARY_STATUS_CODES;
}

interface IProjectLinkProject {
  project_guid: string;
  project_title: string;
  proponent_project_id: string;
  contacts: IProjectLinkContact[];
  project_summary: IProjectLinkSummary;
}

export interface IProjectLink {
  project_link_guid: string;
  project_guid: string;
  related_project_guid: string;
  update_user: string;
  update_timestamp: string;
  create_user: string;
  create_timestamp: string;
  project: IProjectLinkProject;
  related_project: IProjectLinkProject;
}

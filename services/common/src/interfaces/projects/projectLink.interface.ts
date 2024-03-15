import {
  PROJECT_SUMMARY_STATUS_CODES,
  MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODES,
} from "@mds/common/constants/enums";

interface IProjectLinkContact {
  first_name: string;
  last_name: string;
  is_primary: boolean;
}

interface IProjectLinkSummary {
  project_summary_guid: string;
  status_code: PROJECT_SUMMARY_STATUS_CODES;
}

interface IMajorMineApplication {
  major_mine_application_guid: string;
  status_code: MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODES;
}

interface IInformationRequirementsTable {
  irt_guid: string;
  status_code: MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODES;
}

interface IProjectLinkProject {
  project_guid: string;
  project_title: string;
  proponent_project_id: string;
  contacts: IProjectLinkContact[];
  project_summary: IProjectLinkSummary;
  major_mine_application: IMajorMineApplication;
  information_requirements_table: IInformationRequirementsTable;
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

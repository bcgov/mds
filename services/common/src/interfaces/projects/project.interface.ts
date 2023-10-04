import {
  ICreateProjectSummary,
  IInformationRequirementsTable,
  IMajorMinesApplication,
  IProjectContact,
  IProjectDecisionPackage,
} from "@mds/common/index";

export interface IProject {
  project_guid: string;
  project_id: number;
  project_title: string;
  mine_name: string;
  mine_guid: string;
  project_lead_name: string;
  project_lead_party_guid: string;
  proponent_project_id: string;
  mrc_review_required: boolean;
  contacts: IProjectContact[];
  project_summary: ICreateProjectSummary;
  information_requirements_table: IInformationRequirementsTable;
  major_mine_application: IMajorMinesApplication;
  project_decision_package: IProjectDecisionPackage;
  update_user: string;
  update_timestamp: string;
  create_user: string;
  create_timestamp: string;
}

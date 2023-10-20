import { IProjectDecisionPackageDocument } from "@mds/common/index";

export interface IProjectDecisionPackage {
  project_decision_package_id: number;
  project_decision_package_guid: string;
  project_guid: string;
  status_code: string;
  documents: IProjectDecisionPackageDocument[];
  update_user: string;
  update_timestamp: string;
  create_user: string;
  create_timestamp: string;
}

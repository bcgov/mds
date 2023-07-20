import { IMineDocument } from "@/index";

export interface IProjectDecisionPackageDocument extends IMineDocument {
  project_decision_package_id: number;
  project_decision_package_document_type_code: string;
}

import { IMineReportPermitRequirement, IUser } from "@mds/common/interfaces";


export interface IBoundingBox {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export enum IPermitConditionChangeType {
  ADDED = "added",
  MODIFIED = "modified",
  UNCHANGED = "unchanged",
  MOVED = "moved"
}

export interface IPermitConditionComparison {
  previous_condition_guid: string;
  text_similarity: number;
  structure_similarity: number;
  combined_score: number;
  change_type: IPermitConditionChangeType;
}
export interface IPermitConditionMeta {
  page: number;
  role?: string;
  bounding_box?: IBoundingBox;
  condition_comparison?: IPermitConditionComparison
}
export interface IPermitCondition {
  permit_condition_id: number;
  permit_amendment_id: number;
  permit_condition_guid: string;
  condition: string;
  condition_type_code: string;
  condition_category_code: string;
  parent_permit_condition_id?: number;
  sub_conditions: IPermitCondition[];
  step: string;
  stepPath?: string;
  display_order: number;
  mineReportPermitRequirement?: IMineReportPermitRequirement;
  meta?: IPermitConditionMeta
  permit_condition_status_code: string;
  top_level_parent_permit_condition_id?: number;
}

export interface IPermitConditionCategory {
  condition_category_code: string;
  description: string;
  display_order: number;
  step: string;
  assigned_review_user?: IUser
  conditions?: IPermitCondition[]
}

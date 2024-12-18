import { IMineReportPermitRequirement } from "@mds/common/interfaces";


export interface IBoundingBox {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export interface IPermitConditionMeta {
  page: number;
  role?: string;
  bounding_box?: IBoundingBox;
}
export interface IPermitCondition {
  permit_condition_id: number;
  permit_amendment_id: number;
  permit_condition_guid: string;
  condition: string;
  condition_type_code: string;
  condition_category_code: string;
  parent_permit_condition_id: number;
  sub_conditions: IPermitCondition[];
  step: string;
  stepPath?: string;
  display_order: number;
  mineReportPermitRequirement?: IMineReportPermitRequirement;
  meta?: IPermitConditionMeta
}

export interface IPermitConditionCategory {
  condition_category_code: string;
  description: string;
  display_order: number;
  step: string;
  conditions?: IPermitCondition[]
}

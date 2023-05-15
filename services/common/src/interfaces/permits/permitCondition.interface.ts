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
  display_order: number;
}

export interface ICreatePermitConditionPayload {
  condition_category_code: string;
  condition_type_code: string;
  display_order: number;
  parent_permit_condition_id: number;
  permit_amendment_id: number;
  parent_condition_type_code: string;
  sibling_condition_type_code: string;
  condition: string;
}

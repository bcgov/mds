export interface IStandardPermitCondition {
  standard_permit_condition_id: number;
  permit_condition_id: number;
  notice_of_work_type: string;
  standard_permit_condition_guid: string;
  condition: string;
  condition_category_code: string;
  parent_standard_permit_condition_id: number;
  parent_permit_condition_id: number;
  condition_type_code: string;
  sub_conditions: IStandardPermitCondition[];
  step: string;
  display_order: number;
}

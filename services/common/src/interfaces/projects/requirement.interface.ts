export interface IRequirement {
  deleted_ind: boolean;
  description: string;
  display_order: number;
  parent_requirement_id: number;
  requirement_guid: string;
  requirement_id: number;
  step: string;
  sub_requirements: IRequirement[];
  version: number;
}

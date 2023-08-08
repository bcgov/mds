import { IactivityEquipment } from ".";

export interface IactivitySummary {
  reclamation_description: string;
  reclamation_cost: number;
  total_disturbed_area: number;
  total_disturbed_area_unit_type_code: string;
  equipment: IactivityEquipment;
}

import { IdefaultActivity } from ".";

export interface Iplacer extends IdefaultActivity {
  is_underground: boolean;
  is_hand_operation: boolean;
  reclamation_area: number;
  has_stream_diversion: boolean;
  reclamation_unit_type_code: string;
  calculated_total_disturbance: number;
}

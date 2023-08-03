import { IdefaultActivity } from ".";

export interface IsettlingPond extends IdefaultActivity {
  proponent_pond_name: string;
  is_ponds_exfiltrated: boolean;
  is_ponds_recycled: boolean;
  is_ponds_discharged: boolean;
  calculated_total_disturbance: number;
}

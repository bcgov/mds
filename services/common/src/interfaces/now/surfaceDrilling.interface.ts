import { IdefaultActivity } from ".";

export interface IsurfaceDrilling extends IdefaultActivity {
  reclamation_core_storage: string;
  calculated_total_disturbance: number;
}

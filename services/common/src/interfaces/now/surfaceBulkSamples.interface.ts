import { IdefaultActivity } from ".";

export interface IsurfaceBulkSamples extends IdefaultActivity {
  processing_method_description: string;
  handling_instructions: string;
  drainage_mitigation_description: string;
  calculated_total_disturbance: number;
}

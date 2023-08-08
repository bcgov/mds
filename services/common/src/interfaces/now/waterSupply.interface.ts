import { IactivityDetails } from ".";

export interface IwaterSupply extends IactivityDetails {
  supply_source_description: string;
  supply_source_type: string;
  water_use_description: string;
  estimate_rate: number;
  pump_size: number;
  intake_location: string;
  calculated_total_disturbance: number;
}

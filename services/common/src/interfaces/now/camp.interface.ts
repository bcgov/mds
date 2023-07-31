export interface Icamp extends IdefaultActivity {
  has_fuel_stored: boolean;
  has_fuel_stored_in_bulk: boolean;
  has_fuel_stored_in_barrels: boolean;
  calculated_total_disturbance: number;
}

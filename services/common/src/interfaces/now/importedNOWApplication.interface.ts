import {
  Iblasting,
  IstatueOfLand,
  Icamp,
  IdefaultActivity,
  IsurfaceDrilling,
  IsandGravelQuarry,
  IsettlingPond,
  IsurfaceBulkSamples,
  IwaterSupply,
  Iplacer,
} from ".";

export interface IimportedNOWApplication {
  now_application_guid: string;
  mine_guid: string;
  mine_name: string;
  mine_no: string;
  mine_region: string;
  imported_to_core: boolean;
  notice_of_work_type_code: string;
  now_application_status_code: string;
  submitted_date: Date;
  received_date: Date;
  latitude: string;
  longitude: string;
  property_name: string;
  tenure_number: string;
  description_of_land: string;
  proposed_start_date: Date;
  proposed_end_date: Date;
  directions_to_site: string;
  status_reason: string;
  status_updated_date: Date;
  decision_by_user_date: Date;
  contacts: any[];
  submission_documents: any[];
  blasting_operation: Iblasting;
  state_of_land: IstatueOfLand;
  camp: Icamp;
  cut_lines_polarization_survey: IdefaultActivity;
  exploration_access: IdefaultActivity;
  exploration_surface_drilling: IsurfaceDrilling;
  mechanical_trenching: IdefaultActivity;
  sand_gravel_quarry_operation: IsandGravelQuarry;
  settling_pond: IsettlingPond;
  surface_bulk_sample: IsurfaceBulkSamples;
  underground_exploration: IdefaultActivity;
  water_supply: IwaterSupply;
  placer_operation: Iplacer;
}

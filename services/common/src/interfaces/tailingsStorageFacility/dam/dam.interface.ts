import {
  ConsequenceClassificationStatusCodeEnum,
  DamTypeEnum,
  OperatingStatusEnum,
} from "@/constants";

export interface ICreateDam {
  consequence_classification: ConsequenceClassificationStatusCodeEnum;
  current_dam_height: number;
  current_elevation: number;
  dam_name: string;
  dam_type: DamTypeEnum;
  latitude: number;
  longitude: number;
  max_pond_elevation: number;
  min_freeboard_required: number;
  mine_tailings_storage_facility_guid: string;
  operating_status: OperatingStatusEnum;
  permitted_dam_crest_elevation: number;
}

export interface IDam extends ICreateDam {
  dam_guid: string;
  update_timestamp: string;
}

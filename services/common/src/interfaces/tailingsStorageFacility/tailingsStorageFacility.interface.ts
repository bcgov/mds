import {
  ConsequenceClassificationStatusCodeEnum,
  FacilityTypeEnum,
  IDam,
  ITRBExemptionStatusCodeEnum,
  StorageLocationEnum,
  TSFOperatingStatusCodeEnum,
  TailingsStorageFacilityTypeEnum,
  IPartyAppt,
} from "@/index";

export interface ICreateTailingsStorageFacility {
  mine_tailings_storage_facility_name: string;
  longitude: number;
  latitude: number;
  consequence_classification_status_code: ConsequenceClassificationStatusCodeEnum;
  itrb_exemption_status_code: ITRBExemptionStatusCodeEnum;
  tsf_operating_status_code: TSFOperatingStatusCodeEnum;
  notes?: string;
  facility_type: FacilityTypeEnum;
  tailings_storage_facility_type: TailingsStorageFacilityTypeEnum;
  storage_location: StorageLocationEnum;
  mines_act_permit_no: string;
  engineer_of_record?: IEngineerOfRecord;
  qualified_person?: IPartyAppt;
  eor_party_guid?: string;
  dams?: IDam[];
}

export interface ITailingsStorageFacility extends ICreateTailingsStorageFacility {
  mine_tailings_storage_facility_guid: string;
  mine_guid: string;
  update_timestamp: string;
}

export interface IEngineerOfRecord extends IPartyAppt {
  mine_party_acknowledgement_status: string;
  status?: string;
}

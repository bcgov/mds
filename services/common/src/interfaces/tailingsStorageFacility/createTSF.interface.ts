import {
  ConsequenceClassificationStatusCodeEnum,
  FacilityTypeEnum,
  ITRBExemptionStatusCodeEnum,
  StorageLocationEnum,
  TailingsStorageFacilityTypeEnum,
  TSFOperatingStatusCodeEnum,
} from "@mds/common/constants";

export interface ICreateTSF {
  mine_tailings_storage_facility_name: string;
  latitude: number;
  longitude: number;
  consequence_classification_status_code: ConsequenceClassificationStatusCodeEnum;
  itrb_exemption_status_code: ITRBExemptionStatusCodeEnum;
  tsf_operating_status_code: TSFOperatingStatusCodeEnum;
  notes: string;
  storage_location: StorageLocationEnum;
  facility_type: FacilityTypeEnum;
  tailings_storage_facility_type: TailingsStorageFacilityTypeEnum;
  mines_act_permit_no: string;
}

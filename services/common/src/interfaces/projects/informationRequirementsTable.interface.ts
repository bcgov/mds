import { MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODE_CODES } from "@mds/common/constants/enums";
import { IIRTDocument } from "./irtDocument.interface";
import { IIRTRequirementsXref } from "./irtRequirementsXref.interface";

export interface IInformationRequirementsTable {
  irt_id: number;
  irt_guid: string;
  documents: IIRTDocument[];
  update_user: string;
  update_timestamp: string;
  create_user: string;
  create_timestamp: string;
  project_guid: string;
  status_code: MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODE_CODES;
  requirements: IIRTRequirementsXref[];
  information_requirements_table_guid?: string;
  information_requirements_table_id?: number;
}

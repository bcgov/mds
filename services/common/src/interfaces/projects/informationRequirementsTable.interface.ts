import { IIRTDocument, IIRTRequirementsXref } from "@/index";

export interface IInformationRequirementsTable {
  irt_id: number;
  irt_guid: string;
  documents: IIRTDocument[];
  update_user: string;
  update_timestamp: string;
  create_user: string;
  create_timestamp: string;
  project_guid: string;
  status_code: string;
  requirements: IIRTRequirementsXref[];
  information_requirements_table_guid?: string;
  information_requirements_table_id?: number;
}

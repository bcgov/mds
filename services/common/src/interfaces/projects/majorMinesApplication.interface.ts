import { IMajorMinesApplicationDocument, MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODE_CODES } from "@mds/common/index";

export interface IMajorMinesApplication {
  major_mine_application_id: number;
  major_mine_application_guid: string;
  project_guid: string;
  status_code: MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODE_CODES;
  documents: IMajorMinesApplicationDocument[];
  update_user: string;
  update_timestamp: string;
  create_user: string;
  create_timestamp: string;
  primary_documents: IMajorMinesApplicationDocument[];
  spatial_documents: IMajorMinesApplicationDocument[];
  supporting_documents: IMajorMinesApplicationDocument[];
}

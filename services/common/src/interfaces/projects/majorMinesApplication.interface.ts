import { IMajorMinesApplicationDocument } from "@mds/common/index";

export interface IMajorMinesApplication {
  major_mine_application_id: number;
  major_mine_application_guid: string;
  project_guid: string;
  status_code: string;
  documents: Partial<IMajorMinesApplicationDocument>[];
  update_user: string;
  update_timestamp: string;
  create_user: string;
  create_timestamp: string;
}

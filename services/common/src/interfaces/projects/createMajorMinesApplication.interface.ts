import { IMajorMinesApplicationDocument, IMajorMinesApplication } from "@mds/common/index";

export interface ICreateMajorMinesApplication extends IMajorMinesApplication {
  mine_name: string;
  primary_contact: string;
  primary_documents: Partial<IMajorMinesApplicationDocument>[];
  spatial_documents?: Partial<IMajorMinesApplicationDocument>[];
  supporting_documents?: Partial<IMajorMinesApplicationDocument>[];
}

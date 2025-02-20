import { IMajorMinesApplication } from "@mds/common/interfaces";

export interface ICreateMajorMinesApplication extends IMajorMinesApplication {
  mine_name: string;
  primary_contact: string;
}

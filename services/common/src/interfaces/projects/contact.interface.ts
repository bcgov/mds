import { IPartyAddress } from "@mds/common/index";

export interface IContact {
  phone_number: string;
  email: string;
  job_title?: string;
  phone_extension?: string;
  company_name?: string;
  is_primary: boolean;
  first_name: string;
  last_name: string;
  address?: IPartyAddress;
}

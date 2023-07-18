export interface IContact {
  name: string;
  phone_number: string;
  email: string;
  job_title?: string;
  phone_extension?: string;
  company_name?: string;
  is_primary: boolean;
}

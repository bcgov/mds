export interface IPermitParty {
  party_guid: string;
  party_type_code: string;
  phone_no: string;
  phone_ext: string;
  email: string;
  party_name: string;
  party_bc_registration_id: string | null;
  party_bc_registration_name: string | null;
  name: string;
  first_name: string;
  state_modified: string;
}

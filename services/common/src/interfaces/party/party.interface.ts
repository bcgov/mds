import {
  IMinePartyAppt,
  IPartyAddress,
  IPartyOrgBookEntity,
  PartyTypeCodeEnum,
} from "@mds/common/index";

export interface IParty {
  address: IPartyAddress;
  business_role_appts: string[];
  email: string;
  email_sec?: string;
  /** The first name of the party, if the party is a person */
  first_name: string;
  idir_username?: string;
  job_title?: string;
  job_title_code?: string;
  mine_party_appt: IMinePartyAppt[];
  /** The Full name of the party */
  // for a person this is `{first_name} {party_name}`, and for an org this is party_name
  name: string;
  now_party_appt: string[];
  organization: IParty;
  organization_guid: string;
  party_guid: string;
  /** party_name: if the party is ORG, the company name, if it's PER, then last_name */
  party_name: string;
  party_orgbook_entity: IPartyOrgBookEntity;
  party_type_code: PartyTypeCodeEnum;
  phone_ext?: string;
  phone_no: string;
  phone_no_sec?: string;
  phone_no_ter?: string;
  phone_sec_ext?: string;
  phone_ter_ext?: string;
  postnominal_letters?: string;
  signature?: string;
}

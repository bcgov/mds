import { IParty } from "@mds/common/index";

export interface IPartyOrgBookEntity {
  party_orgbook_entity_id: string;
  registration_id: string;
  registration_status: boolean;
  registration_date: string;
  name_id: number;
  name_text: string;
  credential_id: number;
  party_guid: string;
  association_user: string;
  association_timestamp: string;
  party: IParty;
}

import { ICreateParty } from "@mds/common/index";

export interface IMergeParties {
  party_guids: string[];
  party: Partial<ICreateParty>;
}

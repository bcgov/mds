import { ICreateParty } from "@/index";

export interface IMergeParties {
  party_guids: string[];
  party: Partial<ICreateParty>;
}

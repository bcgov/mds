import { ICreateParty } from "./createParty.interface";

export interface IMergeParties {
  party_guids: string[];
  party: Partial<ICreateParty>;
}

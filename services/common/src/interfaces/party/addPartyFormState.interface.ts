import { ICreateParty } from "./createParty.interface";

export interface IAddPartyFormState {
  showingAddPartyForm: boolean;
  person: boolean;
  organization: boolean;
  partyLabel: string;
  initialValues: Partial<ICreateParty>;
}

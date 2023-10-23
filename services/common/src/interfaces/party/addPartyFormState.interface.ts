import { ICreateParty } from "@mds/common/index";

export interface IAddPartyFormState {
  showingAddPartyForm: boolean;
  person: boolean;
  organization: boolean;
  partyLabel: string;
  initialValues: Partial<ICreateParty>;
}

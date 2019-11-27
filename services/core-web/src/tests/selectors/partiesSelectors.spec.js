import {
  getParties,
  getPartyIds,
  getPartyPageData,
  getLastCreatedParty,
} from "@/selectors/partiesSelectors";
import partiesReducer from "@/reducers/partiesReducer";
import { storeParties, storeLastCreatedParty } from "@/actions/partyActions";
import { PARTIES } from "@/constants/reducerTypes";

describe("partiesSelectors", () => {
  const listInput = {
    current_page: 1,
    items_per_page: 25,
    total: 11326,
    total_pages: 454,
    records: [{ party_guid: "test123" }, { party_guid: "test456" }],
  };
  const listProcessed = { test123: { party_guid: "test123" }, test456: { party_guid: "test456" } };

  it("`getParties` calls `partiesReducer.getParties`", () => {
    const storeAction = storeParties(listInput);
    const storeState = partiesReducer({}, storeAction);
    const mockState = {
      [PARTIES]: storeState,
    };

    expect(getParties(mockState)).toEqual(listProcessed);
  });

  it("`getPartyIds` calls `partiesReducer.getPartyIds`", () => {
    const storeAction = storeParties(listInput);
    const storeState = partiesReducer({}, storeAction);
    const mockState = {
      [PARTIES]: storeState,
    };

    expect(getPartyIds(mockState)).toEqual(["test123", "test456"]);
  });

  it("`getPartyPageData` calls `partiesReducer.getPartyPageData`", () => {
    const storeAction = storeParties(listInput);
    const storeState = partiesReducer({}, storeAction);
    const mockState = {
      [PARTIES]: storeState,
    };

    expect(getPartyPageData(mockState)).toEqual({
      current_page: 1,
      items_per_page: 25,
      total: 11326,
      total_pages: 454,
      records: [{ party_guid: "test123" }, { party_guid: "test456" }],
    });
  });

  it("`getLastCreatedParty` calls `partiesReducer.getLastCreatedParty`", () => {
    const party = { party_guid: "test123" };
    const storeAction = storeLastCreatedParty(party);
    const storeState = partiesReducer({}, storeAction);
    const mockState = {
      [PARTIES]: storeState,
    };

    expect(getLastCreatedParty(mockState)).toEqual(party);
  });
});

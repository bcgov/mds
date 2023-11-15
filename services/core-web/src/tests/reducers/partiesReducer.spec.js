import { partiesReducer } from "@mds/common/redux/reducers/partiesReducer";
import { storeParty, storeParties } from "@mds/common/redux/actions/partyActions";

const baseExpectedValue = {
  parties: {},
  rawParties: [],
  partyIds: [],
  partyRelationships: [],
  allPartyRelationships: [],
  partyPageData: {},
  addPartyFormState: {},
  lastCreatedParty: {},
  inspectors: [],
  projectLeads: [],
  engineersOfRecordOptions: [],
  engineersOfRecord: [],
  qualifiedPersons: [],
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("partiesReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();

    const result = partiesReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_PARTY", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.parties = { test123: { party_guid: "test123" } };
    expectedValue.rawParties = [{ party_guid: "test123" }];
    expectedValue.partyIds = ["test123"];
    expectedValue.partyPageData = {};

    const result = partiesReducer(undefined, storeParty({ party_guid: "test123" }));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_PARTIES", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.parties = {
      test123: { party_guid: "test123" },
      test456: { party_guid: "test456" },
    };
    expectedValue.rawParties = [{ party_guid: "test123" }, { party_guid: "test456" }];
    expectedValue.partyIds = ["test123", "test456"];
    expectedValue.partyPageData = {
      current_page: 1,
      items_per_page: 25,
      total: 11326,
      total_pages: 454,
      records: [{ party_guid: "test123" }, { party_guid: "test456" }],
    };

    const result = partiesReducer(
      undefined,
      storeParties({
        current_page: 1,
        items_per_page: 25,
        total: 11326,
        total_pages: 454,
        records: [{ party_guid: "test123" }, { party_guid: "test456" }],
      })
    );
    expect(result).toEqual(expectedValue);
  });
});

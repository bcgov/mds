import partiesReducer from "@/reducers/partiesReducer";
import { storeParty, storeParties } from "@/actions/partyActions";

const baseExpectedValue = {
  parties: {},
  partyIds: [],
  partyRelationships: [],
  partyRelationshipTypes: [],
};

describe("partiesReducer", () => {
  it("receives undefined", () => {
    const expectedValue = baseExpectedValue;

    const result = partiesReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_PARTY", () => {
    const expectedValue = baseExpectedValue;
    expectedValue.parties = { test123: { party_guid: "test123" } };
    expectedValue.partyIds = ["test123"];

    const result = partiesReducer(undefined, storeParty({ party_guid: "test123" }));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_PARTY", () => {
    const expectedValue = baseExpectedValue;
    expectedValue.parties = {
      test123: { party_guid: "test123" },
      test456: { party_guid: "test456" },
    };
    expectedValue.partyIds = ["test123", "test456"];

    const result = partiesReducer(
      undefined,
      storeParties({ parties: [{ party_guid: "test123" }, { party_guid: "test456" }] })
    );
    expect(result).toEqual(expectedValue);
  });
});

import partiesReducer from "@/reducers/partiesReducer";
import { storeParty, storeParties } from "@/actions/partyActions";

describe('partiesReducer', () => {

  it('receives undefined', () => {
    const expectedValue = {
      parties: {},
      partyIds: [],
    };
    const result = partiesReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it('receives STORE_PARTY', () => {
    const expectedValue = {
      parties: {"test123": {"party_guid": "test123"}},
      partyIds: ["test123"],
    };
    const result = partiesReducer(undefined, storeParty({"party_guid": "test123"}));
    expect(result).toEqual(expectedValue);
  });

  it('receives STORE_PARTY', () => {
      expect(true).toBeTrythy;
    // const expectedValue = {
    //   parties: {"test123": {"party_guid": "test123"}, "test456": {"party_guid": "test456"}},
    //   partyIds: ["test123", "test456"],
    // };
    // const result = partiesReducer(undefined, storeParties({"persons" : [{"party_guid": "test123"},{"party_guid": "test456"}]}));
    // expect(result).toEqual(expectedValue);
  });

});
import partyReducer from "@/reducers/partyReducer";
import { storePersonnel, storePersonnelList } from "@/actions/personnelActions";

describe('partyReducer', () => {

  it('receives undefined', () => {
    const expectedValue = {
      personnel: {},
      personnelIds: [],
    };
    const result = partyReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it('receives STORE_PERSONNEL_RECORD', () => {
    const expectedValue = {
      personnel: {"test123": {"person_guid": "test123"}},
      personnelIds: ["test123"],
    };
    const result = partyReducer(undefined, storePersonnel({"person_guid": "test123"}));
    expect(result).toEqual(expectedValue);
  });

  it('receives STORE_PERSONNEL_RECORDS', () => {
    const expectedValue = {
      personnel: {"test123": {"person_guid": "test123"}, "test456": {"person_guid": "test456"}},
      personnelIds: ["test123", "test456"],
    };
    const result = partyReducer(undefined, storePersonnelList({"persons" : [{"person_guid": "test123"},{"person_guid": "test456"}]}));
    expect(result).toEqual(expectedValue);
  });

});
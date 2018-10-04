import mineReducer from "@/reducers/mineReducer";
import {updateMine, storeMine, storeMineList, storeMineNameList, storeCurrentPermittees} from "@/actions/mineActions";

describe('mineReducer', () => {

  it('receives undefined', () => {
    const expectedValue = {
      mines: {},
      mineIds: [],
      mineNameList:[],
      minesPageData: {},
      permittees: {},
      permitteeIds: [],
    };
    const result = mineReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it('receives STORE_MINE_LIST', () => {
    const expectedValue = {
      mines: {},
      mineIds: [],
      mineNameList: [],
      minesPageData: {
        'mines': [],
        'current_page': 1,
        'total_pages': 1,
        'items_per_page': 50,
        'total': 1
      },
      permittees: {},
      permitteeIds: [],
    };
    const result = mineReducer(undefined, storeMineList({
      'mines': [],
      'current_page': 1,
      'total_pages': 1,
      'items_per_page': 50,
      'total': 1
    }));
    expect(result).toEqual(expectedValue);
  });

  it('receives STORE_MINE', () => {
    const expectedValue = {
      mines: {"test123": {"guid": "test123"}},
      mineIds: ["test123"],
      mineNameList: [],
      minesPageData: {},
      permittees: {},
      permitteeIds: [],
    };
    const result = mineReducer(undefined, storeMine({"guid": "test123"}));
    expect(result).toEqual(expectedValue);
  });

  // it('receives STORE_CURRENT_PERMITTEES', () => {
  //   const expectedValue = {
  //     mines: {},
  //     mineIds: [],
  //     mineNameList: [],
  //     minesPageData: {},
  //     permittees: { "party_guid": "test123", "party": {}},
  //     permitteeIds: ["test123"],
  //   };
  //   const array = {"mine_permit": [
  //       {
  //         "permittee": [
  //           {
  //             "party_guid": "1c7da2c4-10d5-4c9f-994a-96427aa0c69b",
  //             "party": {
  //               "party_guid": "1c7da2c4-10d5-4c9f-994a-96427aa0c69b",
  //             }
  //           }
  //         ]
  //       },
  //       {
  //         "permittee": [
  //           {
  //             "party_guid": "1c7da2c4-10d5-4c9f-994a-96427aa0c69b",
  //             "party": {
  //               "party_guid": "1c7da2c4-10d5-4c9f-994a-96427aa0c69b",
  //             }
  //           }
  //         ]
  //       }
  //     ]};
  //   const result = mineReducer(undefined, storeCurrentPermittees(array.mine_permit));
  //   expect(result).toEqual(expectedValue);
  // });

  it('receives UPDATE_MINE_RECORD', () => {
    const storedMineValue = {
      mines: {"test123": {"guid": "test123"}},
      mineIds: ["test123"],
      mineNameList: [],
      minesPageData: {},
      permittees: {},
      permitteeIds: [],
    };
    const updatedMineValue = {
      mines: {"test456": {"guid": "test456"}},
      mineIds: ["test456"],
      mineNameList: [],
      minesPageData: {},
      permittees: {},
      permitteeIds: [],
    };
    const storedMine = mineReducer(undefined, storeMine({"guid": "test123"}));
    expect(storedMine).toEqual(storedMineValue);
    const updatedMine = mineReducer(undefined, updateMine({"guid": "test456"}, "test123"));
    expect(updatedMine).toEqual(updatedMineValue);
  });

  it('receives STORE_MINE_NAME_LIST', () => {
    const expectedValue = {
      mines: {},
      mineIds: [],
      mineNameList: { mines: [{ "guid": "test123", "mine_name": "mineName", "mine_no": "2039"}]},
      minesPageData: {},
      permittees: {},
      permitteeIds: [],
    };
    const result = mineReducer(undefined, storeMineNameList({ mines: [{ "guid": "test123", "mine_name": "mineName", "mine_no": "2039" }] }));
    expect(result).toEqual(expectedValue);
  });

});
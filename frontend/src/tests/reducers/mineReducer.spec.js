import mineReducer from "../../reducers/mineReducer";
import {updateMine, storeMine, storeMineList, storeMineNameList} from "../../actions/mineActions";

describe('mineReducer', () => {

  it('receives undefined', () => {
    const expectedValue = {
      mines: {},
      mineIds: [],
      mineNameList:[],
    };
    const result = mineReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it('receives STORE_MINE_RECORDS', () => {
    const expectedValue = {
      mines: {"test123": {"guid": "test123"}, "test456": {"guid": "test456"}},
      mineIds: ["test123", "test456"],
      mineNameList: [],
    };
    const result = mineReducer(undefined, storeMineList({"mines": [{"guid": "test123"}, {"guid": "test456"}]}));
    expect(result).toEqual(expectedValue);
  });

  it('receives STORE_MINE_RECORD', () => {
    const expectedValue = {
      mines: {"test123": {"guid": "test123"}},
      mineIds: ["test123"],
      mineNameList: [],
    };
    const result = mineReducer(undefined, storeMine({"guid": "test123"}));
    expect(result).toEqual(expectedValue);
  });

  it('receives UPDATE_MINE_RECORD', () => {
    const storedMineValue = {
      mines: {"test123": {"guid": "test123"}},
      mineIds: ["test123"],
      mineNameList: [],
    };
    const updatedMineValue = {
      mines: {"test456": {"guid": "test456"}},
      mineIds: ["test456"],
      mineNameList: [],
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
    };
    const result = mineReducer(undefined, storeMineNameList({ mines: [{ "guid": "test123", "mine_name": "mineName", "mine_no": "2039" }] }));
    expect(result).toEqual(expectedValue);
  });

});
import mineReducer from "../../reducers/mineReducer";
import {updateMine, storeMine, storeMines} from "../../actions/mineActions";

describe('mineReducer', () => {

  it('receives undefined', () => {
    const expectedValue = {
      mines: {},
      mineIds: [],
    };
    const result = mineReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it('receives STORE_MINE_RECORDS', () => {
    const expectedValue = {
      mines: {"test123": {"guid": "test123"}, "test456": {"guid": "test456"}},
      mineIds: ["test123", "test456"],
    };
    const result = mineReducer(undefined, storeMines({"mines": [{"guid": "test123"}, {"guid": "test456"}]}));
    expect(result).toEqual(expectedValue);
  });

  it('receives STORE_MINE_RECORD', () => {
    const expectedValue = {
      mines: {"test123": {"guid": "test123"}},
      mineIds: ["test123"],
    };
    const result = mineReducer(undefined, storeMine({"guid": "test123"}));
    expect(result).toEqual(expectedValue);
  });

  it('receives UPDATE_MINE_RECORD', () => {
    const storedMineValue = {
      mines: {"test123": {"guid": "test123"}},
      mineIds: ["test123"],
    };
    const updatedMineValue = {
      mines: {"test456": {"guid": "test456"}},
      mineIds: ["test456"],
    };
    const storedMine = mineReducer(undefined, storeMine({"guid": "test123"}));
    expect(storedMine).toEqual(storedMineValue);
    const updatedMine = mineReducer(undefined, updateMine({"guid": "test456"}, "test123"));
    expect(updatedMine).toEqual(updatedMineValue);
  });

});
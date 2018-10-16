import {getMineIds, getMines, getMineNames } from "@/selectors/mineSelectors";
import mineReducer from "@/reducers/mineReducer";
import { storeMineList, storeMineNameList } from "@/actions/mineActions";
import { MINES } from "@/constants/reducerTypes";

describe('mineSelectors', () => {
  const mineListInput = {"mines": [{"guid": "test123"}, {"guid": "test456"}]};
  const mineListProcessed = {"test123": {"guid": "test123"}, "test456": {"guid": "test456"}};
  const mineNameList = {"mines": [{"guid": "test123"}, {"guid": "test456"}]};

  it('`getMines` calls `mineReducer.getMines`', () => {
    const storeAction = storeMineList(mineListInput);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState
    };

    expect(getMines(mockState)).toEqual(mineListProcessed);
  });

  it('`getMineIds` calls `mineReducer.getMineIds`', () => {
    const storeAction = storeMineList(mineListInput);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState
    };

    expect(getMineIds(mockState)).toEqual(["test123", "test456"]);
  });

  it('`getMineNames` calls `mineReducer.getMineNames`', () => {
    const storeAction = storeMineNameList(mineNameList);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState
    };
    expect(getMineNames(mockState)).toEqual({"mines": [{"guid": "test123"}, {"guid": "test456"}]});
  });
});
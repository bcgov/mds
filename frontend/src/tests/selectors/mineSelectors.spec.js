import {getMineIds, getMines } from "../../selectors/mineSelectors";
import mineReducer from "@/reducers/mineReducer";
import {storeMineList} from "../../actions/mineActions";
import {MINES} from "../../constants/reducerTypes";

describe('mineSelectors', () => {
  const mineListInput = {"mines": [{"guid": "test123"}, {"guid": "test456"}]};
  const mineListProcessed = {"test123": {"guid": "test123"}, "test456": {"guid": "test456"}};

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
});
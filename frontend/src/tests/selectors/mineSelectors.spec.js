import {
  getMineIds,
  getMines,
  getMineNames,
  getMineGuid,
  getCurrentPermittees,
  getCurrentPermitteeIds,
  getMinesPageData,
} from "@/selectors/mineSelectors";
import mineReducer from "@/reducers/mineReducer";
import { storeMineList, storeMineNameList, storeMine } from "@/actions/mineActions";
import { MINES } from "@/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockResponse = Mock.MINE_RESPONSE;
const mineResponse = Mock.MINE_RESPONSE.mines[1];
const mockState = {
  mines: Mock.MINES.mines,
  mineIds: Mock.MINES.mineIds,
  mineNameList: Mock.MINE_NAME_LIST,
  minesPageData: Mock.PAGE_DATA,
  mineGuid: false,
};

describe("mineSelectors", () => {
  const { mineIds, mineNameList, minesPageData } = mockState;
  const { mines, mineGuid } = mockState;

  it("`getMines` calls `mineReducer.getMines`", () => {
    const storeAction = storeMineList(mockResponse);
    const storeState = mineReducer({}, storeAction);
    const localMockState = {
      [MINES]: storeState,
    };
    expect(getMines(localMockState)).toEqual(mines);
  });

  it("`getMineGuid` calls `mineReducer.getMineGuid` when `storeMineList` is dispatched", () => {
    const storeAction = storeMineList(mockResponse);
    const storeState = mineReducer({}, storeAction);
    const localMockState = {
      [MINES]: storeState,
    };
    expect(getMineGuid(localMockState)).toEqual(mineGuid);
  });

  it("`getMineGuid` calls `mineReducer.getMineGuid` when `storeMine` is dispatched", () => {
    const storeAction = storeMine(mineResponse, "18145c75-49ad-0101-85f3-a43e45ae989a");
    const storeState = mineReducer({}, storeAction);
    const localMockState = {
      [MINES]: storeState,
    };
    expect(getMineGuid(localMockState)).toEqual("18145c75-49ad-0101-85f3-a43e45ae989a");
  });

  it("`getMineIds` calls `mineReducer.getMineIds`", () => {
    const storeAction = storeMineList(mockResponse);
    const storeState = mineReducer({}, storeAction);
    const localMockState = {
      [MINES]: storeState,
    };
    expect(getMineIds(localMockState)).toEqual(mineIds);
  });

  it("`getMineNames` calls `mineReducer.getMineNames`", () => {
    const storeAction = storeMineNameList(Mock.MINE_NAME_LIST);
    const storeState = mineReducer({}, storeAction);
    const localMockState = {
      [MINES]: storeState,
    };
    expect(getMineNames(localMockState)).toEqual(mineNameList);
  });

  it("`getMinesPageData` calls `mineReducer.getMinesPageData`", () => {
    const storeAction = storeMineList(Mock.PAGE_DATA);
    const storeState = mineReducer({}, storeAction);
    const localMockState = {
      [MINES]: storeState,
    };
    expect(getMinesPageData(localMockState)).toEqual(minesPageData);
  });

  it("`getCurrentPermittees` calls `mineReducer.getCurrentPermittees`", () => {
    const localMines = Mock.MINES.mines;
    const localMineGuid = Mock.MINES.mineIds[1];
    const selected = getCurrentPermittees.resultFunc(localMines, localMineGuid);
    expect(selected).toEqual(Mock.PERMITTEE.permittees);
  });

  it("`getCurrentPermitteeIds` calls `mineReducer.getCurrentPermitteeIds`", () => {
    const localMines = Mock.MINES.mines;
    const localMineGuid = Mock.MINES.mineIds[1];
    const selected = getCurrentPermitteeIds.resultFunc(localMines, localMineGuid);
    expect(selected).toEqual(["1c7da2c4-10d5-4c9f-994a-96427aa0c69b"]);
  });
});

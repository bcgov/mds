import {
  getMineIds,
  getMines,
  getMineNames,
  getMineGuid,
  getMinesPageData,
  getSubscribedMines,
  getIsUserSubscribed,
  getMineBasicInfoList,
  getMineDocuments,
  getMineComments,
} from "@mds/common/redux/selectors/mineSelectors";
import { mineReducer } from "@mds/common/redux/reducers/mineReducer";
import {
  storeMineList,
  storeMineNameList,
  storeMine,
  storeSubscribedMines,
  storeMineBasicInfoList,
  storeMineDocuments,
  storeMineComments,
} from "@mds/common/redux/actions/mineActions";
import { MINES } from "@mds/common/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockResponse = Mock.MINE_RESPONSE;
const mineResponse = Mock.MINE_RESPONSE.mines[1];
const mockState = {
  mines: Mock.MINES.mines,
  mineIds: Mock.MINES.mineIds,
  mineNameList: Mock.MINE_NAME_LIST.mines,
  minesPageData: Mock.PAGE_DATA,
  mineGuid: "",
  subscribedMines: Mock.SUBSCRIBED_MINES.mines,
  mineBasicInfoList: Mock.MINE_BASIC_INFO,
  mineDocuments: Mock.MINEDOCUMENTS.records,
  mineComments: Mock.MINE_COMMENTS.records,
};

describe("mineSelectors", () => {
  const {
    mineIds,
    mineNameList,
    minesPageData,
    mineBasicInfoList,
    mineDocuments,
    subscribedMines,
    mineComments,
  } = mockState;
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

  it("`getSubscribedMines` calls `mineReducer.getSubscribedMines`", () => {
    const storeAction = storeSubscribedMines(Mock.SUBSCRIBED_MINES);
    const storeState = mineReducer({}, storeAction);
    const localMockState = {
      [MINES]: storeState,
    };
    expect(getSubscribedMines(localMockState)).toEqual(subscribedMines);
  });

  it("`getIsUserSubscribed` calls `mineReducer.getSubscribedMines`", () => {
    const storeAction = storeSubscribedMines(Mock.SUBSCRIBED_MINES);
    const storeState = mineReducer({}, storeAction);
    const localMockState = {
      [MINES]: storeState,
    };
    expect(getIsUserSubscribed(localMockState)).toEqual(false);
  });

  it("`getMineBasicInfoList` calls `mineReducer.getMineBasicInfoList`", () => {
    const storeAction = storeMineBasicInfoList(Mock.MINE_BASIC_INFO);
    const storeState = mineReducer({}, storeAction);
    const localMockState = {
      [MINES]: storeState,
    };
    expect(getMineBasicInfoList(localMockState)).toEqual(mineBasicInfoList);
  });

  it("`getMineDocuments` calls `mineReducer.getMineDocuments`", () => {
    const storeAction = storeMineDocuments(Mock.MINEDOCUMENTS);
    const storeState = mineReducer({}, storeAction);
    const localMockState = {
      [MINES]: storeState,
    };
    expect(getMineDocuments(localMockState)).toEqual(mineDocuments);
  });

  it("`getMineComments` calls `mineReducer.getMineDocuments`", () => {
    const storeAction = storeMineComments(Mock.MINE_COMMENTS);
    const storeState = mineReducer({}, storeAction);
    const localMockState = {
      [MINES]: storeState,
    };
    expect(getMineComments(localMockState)).toEqual(mineComments);
  });
});

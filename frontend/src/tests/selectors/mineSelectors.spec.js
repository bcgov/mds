import {
  getMineIds,
  getMines,
  getMineNames,
  getMineRegionOptions,
  getMineStatusOptions,
  getMineGuid,
  getCurrentPermittees,
  getCurrentPermitteeIds,
  getMinesPageData
} from "@/selectors/mineSelectors";
import mineReducer from "@/reducers/mineReducer";
import { storeMineList, storeMineNameList, storeStatusOptions, storeRegionOptions, storeMine } from "@/actions/mineActions";
import { MINES } from "@/constants/reducerTypes";
import * as Mock from '@/tests/mocks/dataMocks';


const mockResponse = Mock.MINE_RESPONSE;
const mineResponse = Mock.MINE_RESPONSE.mines[1];
const mockState = {
  mines: Mock.MINES.mines,
  mineIds: Mock.MINES.mineIds,
  mineNameList: Mock.MINE_NAME_LIST,
  minesPageData: Mock.PAGE_DATA,
  mineGuid: false,
  mineStatusOptions: Mock.STATUS_OPTIONS.options,
  mineRegionOptions: Mock.REGION_OPTIONS.options
};

describe('mineSelectors', () => {
  let { mines, mineIds, mineNameList, minesPageData, mineGuid, mineStatusOptions, mineRegionOptions} = mockState;

  it('`getMines` calls `mineReducer.getMines`', () => {
    const storeAction = storeMineList(mockResponse);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState
    };
    expect(getMines(mockState)).toEqual(mines);
  });

  it('`getMineGuid` calls `mineReducer.getMineGuid` when `storeMineList` is dispatched', () => {
    const storeAction = storeMineList(mockResponse);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState
    };
    expect(getMineGuid(mockState)).toEqual(mineGuid);
  });

  it('`getMineGuid` calls `mineReducer.getMineGuid` when `storeMine` is dispatched', () => {
    const storeAction = storeMine(mineResponse, "18145c75-49ad-0101-85f3-a43e45ae989a");
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState
    };
    expect(getMineGuid(mockState)).toEqual("18145c75-49ad-0101-85f3-a43e45ae989a");
  });

  it('`getMineIds` calls `mineReducer.getMineIds`', () => {
    const storeAction = storeMineList(mockResponse);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState
    };
    expect(getMineIds(mockState)).toEqual(mineIds);
  });

  it('`getMineNames` calls `mineReducer.getMineNames`', () => {
    const storeAction = storeMineNameList(Mock.MINE_NAME_LIST);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState
    };
    expect(getMineNames(mockState)).toEqual(mineNameList);
  });

  it('`getMineStatusOptions` calls `mineReducer.getMineStatusOptions`', () => {
    const storeAction = storeStatusOptions(Mock.STATUS_OPTIONS);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState
    };
    expect(getMineStatusOptions(mockState)).toEqual(mineStatusOptions);
  });

  it('`getMineRegionOptions` calls `mineReducer.getMineRegionOptions`', () => {
    const storeAction = storeRegionOptions(Mock.REGION_OPTIONS);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState
    };
    expect(getMineRegionOptions(mockState)).toEqual(mineRegionOptions);
  });

  it('`getMinesPageData` calls `mineReducer.getMinesPageData`', () => {
    const storeAction = storeMineList(Mock.PAGE_DATA);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState
    };
    expect(getMinesPageData(mockState)).toEqual(minesPageData);
  });

  it('`getCurrentPermittees` calls `mineReducer.getCurrentPermittees`', () => {
    mines = Mock.MINES.mines;
    mineGuid = Mock.MINES.mineIds[1]
    const selected = getCurrentPermittees.resultFunc(mines, mineGuid);
    expect(selected).toEqual((Mock.PERMITTEE.permittees));
  });

  it('`getCurrentPermitteeIds` calls `mineReducer.getCurrentPermitteeIds`', () => {
    mines =  Mock.MINES.mines;
    mineGuid = Mock.MINES.mineIds[1];
    const selected = getCurrentPermitteeIds.resultFunc(mines, mineGuid);
    expect(selected).toEqual(["1c7da2c4-10d5-4c9f-994a-96427aa0c69b"]);
  });
});
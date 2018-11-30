import {
  getMineIds,
  getMines,
  getMineNames,
  getMineRegionOptions,
  getMineStatusOptions,
  getMineGuid,
  getCurrentPermittees,
  getCurrentPermitteeIds,
  getMinesPageData,
  getMineRegionHash,
  getMineTSFRequiredReports,
  getMineTSFRequiredDocumentsHash,
  getMineTenureTypesHash,
} from "@/selectors/mineSelectors";
import mineReducer from "@/reducers/mineReducer";
import {
  storeMineList,
  storeMineNameList,
  storeStatusOptions,
  storeRegionOptions,
  storeMine,
  storeTenureTypes,
} from "@/actions/mineActions";
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
  mineStatusOptions: Mock.STATUS_OPTIONS.options,
  mineRegionOptions: Mock.REGION_OPTIONS.options,
  expectedDocumentStatusOptions : Mock.EXPECTED_DOCUMENT_STATUS_OPTIONS.options,
  mineTSFRequiredReports : Mock.MINE_TSF_REQUIRED_REPORTS
};

describe("mineSelectors", () => {
  let {
    mines,
    mineIds,
    mineNameList,
    minesPageData,
    mineGuid,
    mineStatusOptions,
    mineRegionOptions,
    mineTSFRequiredReports,
    mineTenureTypes,
  } = mockState;

  it("`getMines` calls `mineReducer.getMines`", () => {
    const storeAction = storeMineList(mockResponse);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState,
    };
    expect(getMines(mockState)).toEqual(mines);
  });

  it("`getMineGuid` calls `mineReducer.getMineGuid` when `storeMineList` is dispatched", () => {
    const storeAction = storeMineList(mockResponse);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState,
    };
    expect(getMineGuid(mockState)).toEqual(mineGuid);
  });

  it("`getMineGuid` calls `mineReducer.getMineGuid` when `storeMine` is dispatched", () => {
    const storeAction = storeMine(mineResponse, "18145c75-49ad-0101-85f3-a43e45ae989a");
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState,
    };
    expect(getMineGuid(mockState)).toEqual("18145c75-49ad-0101-85f3-a43e45ae989a");
  });

  it("`getMineIds` calls `mineReducer.getMineIds`", () => {
    const storeAction = storeMineList(mockResponse);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState,
    };
    expect(getMineIds(mockState)).toEqual(mineIds);
  });

  it("`getMineNames` calls `mineReducer.getMineNames`", () => {
    const storeAction = storeMineNameList(Mock.MINE_NAME_LIST);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState,
    };
    expect(getMineNames(mockState)).toEqual(mineNameList);
  });

  it("`getMineStatusOptions` calls `mineReducer.getMineStatusOptions`", () => {
    const storeAction = storeStatusOptions(Mock.STATUS_OPTIONS);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState,
    };
    expect(getMineStatusOptions(mockState)).toEqual(mineStatusOptions);
  });

  it("`getMineRegionOptions` calls `mineReducer.getMineRegionOptions`", () => {
    const storeAction = storeRegionOptions(Mock.REGION_OPTIONS);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState,
    };
    expect(getMineRegionOptions(mockState)).toEqual(mineRegionOptions);
  });

  it("`getMinesPageData` calls `mineReducer.getMinesPageData`", () => {
    const storeAction = storeMineList(Mock.PAGE_DATA);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState,
    };
    expect(getMinesPageData(mockState)).toEqual(minesPageData);
  });

  it('`getMineTSFRequiredReports` calls `mineReducer.getMineTSFRequiredReports`', () => {
    const storeAction = storeMineTSFRequiredDocuments(Mock.MINE_TSF_REQUIRED_REPORTS_RESPONSE);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState
    };
    expect(getMineTSFRequiredReports(mockState)).toEqual(mineTSFRequiredReports);
  });

  it('`getCurrentPermittees` calls `mineReducer.getCurrentPermittees`', () => {
    mines = Mock.MINES.mines;
    mineGuid = Mock.MINES.mineIds[1];
    const selected = getCurrentPermittees.resultFunc(mines, mineGuid);
    expect(selected).toEqual(Mock.PERMITTEE.permittees);
  });

  it("`getCurrentPermitteeIds` calls `mineReducer.getCurrentPermitteeIds`", () => {
    mines = Mock.MINES.mines;
    mineGuid = Mock.MINES.mineIds[1];
    const selected = getCurrentPermitteeIds.resultFunc(mines, mineGuid);
    expect(selected).toEqual(["1c7da2c4-10d5-4c9f-994a-96427aa0c69b"]);
  });

  it("`getMineRegionHash` converts `mineReducer.getMineRegionOptions`", () => {
    mineRegionOptions = Mock.REGION_OPTIONS.options;
    const selected = getMineRegionHash.resultFunc(mineRegionOptions);
    expect(selected).toEqual(Mock.REGION_HASH);
  });

  it('`getMineTSFRequiredDocumentsHash` calls `mineReducer.getMineTSFRequiredReports`', () => {
    mineTSFRequiredReports = Mock.MINE_TSF_REQUIRED_REPORTS;
    const selected = getMineTSFRequiredDocumentsHash.resultFunc(mineTSFRequiredReports);
    expect(selected).toEqual(Mock.MINE_TSF_REQUIRED_REPORTS_HASH);
  });

  it("`getMineTenureTypesHash` converts `mineReducer.getMineTenureTypes`", () => {
    mineTenureTypes = Mock.TENURE_TYPES.options;
    const selected = getMineTenureTypesHash.resultFunc(mineTenureTypes);
    expect(selected).toEqual(Mock.TENURE_HASH);
  });

  it("`getMineTenureTypes` calls `mineReducer.getMineTenureTypes`", () => {
    const storeAction = storeRegionOptions(Mock.TENURE_TYPES);
    const storeState = mineReducer({}, storeAction);
    const mockState = {
      [MINES]: storeState,
    };
    expect(getMineRegionOptions(mockState)).toEqual(mineTenureTypes);
  });
});

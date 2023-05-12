import { mineReducer } from "@common/reducers/mineReducer";
import {
  storeMine,
  storeMineList,
  storeMineNameList,
  storeSubscribedMines,
  storeMineComments,
} from "@common/actions/mineActions";
import * as MOCK from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  mines: {},
  mineIds: [],
  mineNameList: [],
  minesPageData: {},
  mineGuid: null,
  mineBasicInfoList: [],
  mineDocuments: [],
  subscribedMines: [],
  mineComments: [],
  currentUserVerifiedMines: [],
  currentUserUnverifiedMinesMines: [],
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("mineReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = mineReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINE_LIST", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.minesPageData = {
      mines: [],
      current_page: 1,
      total_pages: 1,
      items_per_page: 50,
      total: 1,
    };
    const result = mineReducer(
      undefined,
      storeMineList({
        mines: [],
        current_page: 1,
        total_pages: 1,
        items_per_page: 50,
        total: 1,
      })
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINE", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.mines = { test123: { mine_guid: "test123" } };
    expectedValue.mineIds = ["test123"];
    expectedValue.mineGuid = "test123";
    const result = mineReducer(undefined, storeMine({ mine_guid: "test123" }, "test123"));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINE_NAME_LIST", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.mineNameList = [{ mine_guid: "test123", mine_name: "mineName", mine_no: "2039" }];
    const result = mineReducer(
      undefined,
      storeMineNameList({
        mines: [{ mine_guid: "test123", mine_name: "mineName", mine_no: "2039" }],
      })
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_SUBSCRIBED_MINES", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.subscribedMines = [{ guid: "test123", mine_name: "mineName", mine_no: "2039" }];
    const result = mineReducer(
      undefined,
      storeSubscribedMines({ mines: [{ guid: "test123", mine_name: "mineName", mine_no: "2039" }] })
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINE_COMMENTS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.mineComments = MOCK.MINE_COMMENTS.records;
    const result = mineReducer(undefined, storeMineComments(MOCK.MINE_COMMENTS));
    expect(result).toEqual(expectedValue);
  });
});

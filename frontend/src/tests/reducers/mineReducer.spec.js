import mineReducer from "@/reducers/mineReducer";
import { storeMine, storeMineList, storeMineNameList } from "@/actions/mineActions";

describe("mineReducer", () => {
  it("receives undefined", () => {
    const expectedValue = {
      mines: {},
      mineIds: [],
      mineNameList: [],
      minesPageData: {},
      mineGuid: false,
    };
    const result = mineReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINE_LIST", () => {
    const expectedValue = {
      mines: {},
      mineIds: [],
      mineNameList: [],
      minesPageData: {
        mines: [],
        current_page: 1,
        total_pages: 1,
        items_per_page: 50,
        total: 1,
      },
      mineGuid: false,
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
    const expectedValue = {
      mines: { test123: { guid: "test123" } },
      mineIds: ["test123"],
      mineNameList: [],
      minesPageData: {},
      mineGuid: "test123",
    };
    const result = mineReducer(undefined, storeMine({ guid: "test123" }, "test123"));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINE_NAME_LIST", () => {
    const expectedValue = {
      mines: {},
      mineIds: [],
      mineNameList: { mines: [{ guid: "test123", mine_name: "mineName", mine_no: "2039" }] },
      minesPageData: {},
      mineGuid: false,
    };
    const result = mineReducer(
      undefined,
      storeMineNameList({ mines: [{ guid: "test123", mine_name: "mineName", mine_no: "2039" }] })
    );
    expect(result).toEqual(expectedValue);
  });
});

import userMineReducer from "@/reducers/userMineReducer";
import { storeMine, storeUserMineInfo, storeMineDocuments } from "@/actions/userMineActions";

const baseExpectedValue = {
  userMineInfo: {
    records: [],
    current_page: 0,
    items_per_page: 0,
    total: 0,
    total_pages: 0,
  },
  mineDocuments: [],
  mine: null,
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("userMineReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = userMineReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_USER_MINE_INFO", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.userMineInfo = { mines: [{ guid: "4aaad42f-ab69-439a-b5f9-78c35f95d0ff" }] };
    const result = userMineReducer(
      undefined,
      storeUserMineInfo({
        mines: [{ guid: "4aaad42f-ab69-439a-b5f9-78c35f95d0ff" }],
      })
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINE", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.mine = { guid: "test123" };
    const result = userMineReducer(undefined, storeMine({ guid: "test123" }));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINE_DOCUMENTS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.mineDocuments = [
      { mine_guid: "4aaad42f-ab69-439a-b5f9-78c35f95d0ff", document_name: "test" },
    ];
    const result = userMineReducer(
      undefined,
      storeMineDocuments({
        records: [{ mine_guid: "4aaad42f-ab69-439a-b5f9-78c35f95d0ff", document_name: "test" }],
      })
    );
    expect(result).toEqual(expectedValue);
  });
});

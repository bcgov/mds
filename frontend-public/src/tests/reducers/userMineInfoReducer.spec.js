import userMineInfoReducer from "@/reducers/userMineInfoReducer";
import { storeMine, storeUserMineInfo, storeMineDocuments } from "@/actions/userMineInfoActions";

const baseExpectedValue = {
  userMineInfo: {},
  mine: {},
  mineDocuments: [],
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("userMineInfoReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = userMineInfoReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_USER_MINE_INFO", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.userMineInfo = { mines: [{ guid: "4aaad42f-ab69-439a-b5f9-78c35f95d0ff" }] };
    const result = userMineInfoReducer(
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
    const result = userMineInfoReducer(undefined, storeMine({ guid: "test123" }));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINE_DOCUMENTS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.mineDocuments = [
      { mine_guid: "4aaad42f-ab69-439a-b5f9-78c35f95d0ff", document_name: "test" },
    ];
    const result = userMineInfoReducer(
      undefined,
      storeMineDocuments({
        mine_documents: [
          { mine_guid: "4aaad42f-ab69-439a-b5f9-78c35f95d0ff", document_name: "test" },
        ],
      })
    );
    expect(result).toEqual(expectedValue);
  });
});

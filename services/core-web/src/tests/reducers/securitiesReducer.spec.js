import { securitiesReducer } from "@common/reducers/securitiesReducer";
import { storeMineBonds } from "@common/actions/securitiesActions";
import * as MOCK from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  bonds: [],
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("securitiesReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = securitiesReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINE_BONDS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.bonds = MOCK.BONDS.records;
    const result = securitiesReducer(undefined, storeMineBonds(MOCK.BONDS));
    expect(result).toEqual(expectedValue);
  });
});

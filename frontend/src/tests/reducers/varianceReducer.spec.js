import varianceReducer from "@/reducers/varianceReducer";
import { storeVariances, storeVariance } from "@/actions/varianceActions";
import * as MOCK from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  mineVariances: [],
  variance: {},
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("varianceReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = varianceReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_STATUS_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.mineVariances = MOCK.VARIANCES.records;
    const result = varianceReducer(undefined, storeVariances(MOCK.VARIANCES));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_VARIANCE", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.variance = MOCK.VARIANCE;
    const result = varianceReducer(undefined, storeVariance(MOCK.VARIANCE));
    expect(result).toEqual(expectedValue);
  });
});

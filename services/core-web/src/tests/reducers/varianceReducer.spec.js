import { varianceReducer } from "@mds/common/redux/reducers/varianceReducer";
import { storeVariances, storeVariance } from "@mds/common/redux/actions/varianceActions";
import * as MOCK from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  variances: [],
  variance: {},
  variancePageData: {},
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("varianceReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = varianceReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_VARIANCES", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.variances = MOCK.VARIANCES.records;
    expectedValue.variancePageData = MOCK.VARIANCES;
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

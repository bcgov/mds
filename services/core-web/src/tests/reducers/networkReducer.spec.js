import { networkReducer } from "@common/reducers/networkReducer";
import { request, success, error } from "@common/actions/genericActions";

const baseExpectedValue = {
  isFetching: false,
  isSuccessful: false,
  error: null,
  requestType: null,
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("networkReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = networkReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives REQUEST", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.isFetching = true;
    expectedValue.requestType = "REQUEST";

    const result = networkReducer(undefined, request());
    expect(result).toEqual(expectedValue);
  });

  it("receives SUCCESS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.isSuccessful = true;
    expectedValue.error = false;
    expectedValue.requestType = "SUCCESS";

    const result = networkReducer(undefined, success());
    expect(result).toEqual(expectedValue);
  });

  it("receives ERROR", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.error = null;
    expectedValue.requestType = "ERROR";

    const result = networkReducer(undefined, error());
    expect(result).toEqual(expectedValue);
  });
});

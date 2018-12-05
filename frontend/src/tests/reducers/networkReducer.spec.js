import networkReducer from "@/reducers/networkReducer";
import { request, success, error } from "@/actions/genericActions";

describe("networkReducer", () => {
  it("receives undefined", () => {
    const expectedValue = {
      isFetching: false,
      isSuccessful: false,
      error: null,
      requestType: null,
    };

    const result = networkReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives REQUEST", () => {
    const expectedValue = {
      isFetching: true,
      isSuccessful: false,
      error: null,
      requestType: "REQUEST",
    };

    const result = networkReducer(undefined, request());
    expect(result).toEqual(expectedValue);
  });

  it("receives SUCCESS", () => {
    const expectedValue = {
      isFetching: false,
      isSuccessful: true,
      error: false,
      requestType: "SUCCESS",
    };

    const result = networkReducer(undefined, success());
    expect(result).toEqual(expectedValue);
  });

  it("receives ERROR", () => {
    const expectedValue = {
      isFetching: false,
      isSuccessful: false,
      error: undefined,
      requestType: "ERROR",
    };

    const result = networkReducer(undefined, error());
    expect(result).toEqual(expectedValue);
  });
});

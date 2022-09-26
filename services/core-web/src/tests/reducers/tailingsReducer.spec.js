import { tailingsReducer } from "@common/reducers/tailingsReducer";
import { storeTsf, clearTsf } from "@common/actions/tailingsActions";
import { TAILINGS_STORAGE_FACILITY } from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  tsf: {},
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("tailingsReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = tailingsReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_TAILINGS_STORAGE_FACILITY", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.tsf = TAILINGS_STORAGE_FACILITY;
    const result = tailingsReducer(undefined, storeTsf(TAILINGS_STORAGE_FACILITY));
    expect(result).toEqual(expectedValue);
  });

  it("receives CLEAR_TAILINGS_STORAGE_FACILITY", () => {
    const expectedValue = getBaseExpectedValue();
    const result = tailingsReducer(undefined, clearTsf());
    expect(result).toEqual(expectedValue);
  });
});

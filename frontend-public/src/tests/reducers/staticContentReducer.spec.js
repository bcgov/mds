import staticContentReducer from "@/reducers/staticContentReducer";
import { storeDocumentStatusOptions } from "@/actions/staticContentActions";
import * as MOCK from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  expectedDocumentStatusOptions: [],
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("staticContentReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = staticContentReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_DOCUMENT_STATUS_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.expectedDocumentStatusOptions = MOCK.EXPECTED_DOCUMENT_STATUS_OPTIONS.options;
    const result = staticContentReducer(
      undefined,
      storeDocumentStatusOptions(MOCK.EXPECTED_DOCUMENT_STATUS_OPTIONS)
    );
    expect(result).toEqual(expectedValue);
  });
});

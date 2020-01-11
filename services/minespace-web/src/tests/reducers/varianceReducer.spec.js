import varianceReducer from "@/reducers/varianceReducer";
import {
  storeVariances,
  storeVarianceStatusOptions,
  storeVarianceDocumentCategoryOptions,
  storeComplianceCodes,
  storeVariance,
} from "@/actions/varianceActions";
import * as MOCK from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  mineVariances: [],
  varianceStatusOptions: [],
  documentCategoryOptions: [],
  complianceCodes: [],
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

  it("receives STORE_VARIANCES", () => {
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

  it("receives STORE_COMPLIANCE_CODES", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.complianceCodes = MOCK.COMPLIANCE_CODES.records;
    const result = varianceReducer(undefined, storeComplianceCodes(MOCK.COMPLIANCE_CODES));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_VARIANCE_STATUS_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.varianceStatusOptions = MOCK.VARIANCE_STATUS_OPTIONS.records;
    const result = varianceReducer(
      undefined,
      storeVarianceStatusOptions(MOCK.VARIANCE_STATUS_OPTIONS)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_VARIANCE_DOCUMENT_CATEGORY_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.documentCategoryOptions = MOCK.VARIANCE_DOCUMENT_CATEGORY_OPTIONS.records;
    const result = varianceReducer(
      undefined,
      storeVarianceDocumentCategoryOptions(MOCK.VARIANCE_DOCUMENT_CATEGORY_OPTIONS)
    );
    expect(result).toEqual(expectedValue);
  });
});

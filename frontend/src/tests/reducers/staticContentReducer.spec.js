import staticContentReducer from "@/reducers/staticContentReducer";
import {
  storeStatusOptions,
  storeRegionOptions,
  storeDocumentStatusOptions,
  storeTenureTypes,
  storeDisturbanceOptions,
  storeCommodityOptions,
  storeProvinceCodes,
  storeApplicationStatusOptions,
  storeComplianceCodes,
  storeVarianceStatusOptions,
  storeVarianceDocumentCategoryOptions,
} from "@/actions/staticContentActions";
import * as MOCK from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  mineStatusOptions: [],
  mineRegionOptions: [],
  mineDisturbanceOptions: [],
  mineTenureTypes: [],
  mineCommodityOptions: [],
  provinceOptions: [],
  permitStatusCodes: [],
  applicationStatusCodes: [],
  complianceCodes: [],
  incidentFollowupActionOptions: [],
  incidentDeterminationOptions: [],
  incidentStatusCodeOptions: [],
  varianceStatusOptions: [],
  varianceDocumentCategoryOptions: [],
  mineReportDefinitionOptions: [],
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("staticContentReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = staticContentReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_STATUS_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.mineStatusOptions = MOCK.STATUS_OPTIONS.records;
    const result = staticContentReducer(undefined, storeStatusOptions(MOCK.STATUS_OPTIONS));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_REGION_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.mineRegionOptions = MOCK.REGION_OPTIONS.records;
    const result = staticContentReducer(undefined, storeRegionOptions(MOCK.REGION_OPTIONS));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_TENURE_TYPES", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.mineTenureTypes = MOCK.TENURE_TYPES_RESPONSE.records;
    const result = staticContentReducer(undefined, storeTenureTypes(MOCK.TENURE_TYPES_RESPONSE));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_DISTURBANCE_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.mineDisturbanceOptions = MOCK.DISTURBANCE_OPTIONS.records;
    const result = staticContentReducer(
      undefined,
      storeDisturbanceOptions(MOCK.DISTURBANCE_OPTIONS)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_COMMODITY_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.mineCommodityOptions = MOCK.COMMODITY_OPTIONS.records;
    const result = staticContentReducer(undefined, storeCommodityOptions(MOCK.COMMODITY_OPTIONS));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_PROVINCE_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.provinceOptions = MOCK.PROVINCE_OPTIONS.records;
    const result = staticContentReducer(undefined, storeProvinceCodes(MOCK.PROVINCE_OPTIONS));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_APPLICATION_STATUS_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.applicationStatusCodes = MOCK.APPLICATION_STATUS_CODE_OPTIONS.records;
    const result = staticContentReducer(
      undefined,
      storeApplicationStatusOptions(MOCK.APPLICATION_STATUS_CODE_OPTIONS)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_COMPLIANCE_CODES", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.complianceCodes = MOCK.COMPLIANCE_CODES.records;
    const result = staticContentReducer(undefined, storeComplianceCodes(MOCK.COMPLIANCE_CODES));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_VARIANCE_STATUS_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.varianceStatusOptions = MOCK.VARIANCE_STATUS_OPTIONS.records;
    const result = staticContentReducer(
      undefined,
      storeVarianceStatusOptions(MOCK.VARIANCE_STATUS_OPTIONS)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_VARIANCE_DOCUMENT_CATEGORY_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.varianceDocumentCategoryOptions = MOCK.VARIANCE_DOCUMENT_CATEGORY_OPTIONS.records;
    const result = staticContentReducer(
      undefined,
      storeVarianceDocumentCategoryOptions(MOCK.VARIANCE_DOCUMENT_CATEGORY_OPTIONS)
    );
    expect(result).toEqual(expectedValue);
  });
});

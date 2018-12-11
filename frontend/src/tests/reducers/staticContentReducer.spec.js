import staticContentReducer from "@/reducers/staticContentReducer";
import {
  storeStatusOptions,
  storeRegionOptions,
  storeDocumentStatusOptions,
  storeMineTSFRequiredDocuments,
  storeTenureTypes,
  storeDisturbanceOptions,
} from "@/actions/staticContentActions";
import * as MOCK from "@/tests/mocks/dataMocks";

describe("staticContentReducer", () => {
  it("receives undefined", () => {
    const expectedValue = {
      mineStatusOptions: [],
      mineRegionOptions: [],
      mineDisturbanceOptions: [],
      expectedDocumentStatusOptions: [],
      mineTSFRequiredReports: [],
      mineTenureTypes: [],
    };
    const result = staticContentReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_STATUS_OPTIONS", () => {
    const expectedValue = {
      mineStatusOptions: MOCK.STATUS_OPTIONS.options,
      mineRegionOptions: [],
      mineDisturbanceOptions: [],
      expectedDocumentStatusOptions: [],
      mineTSFRequiredReports: [],
      mineTenureTypes: [],
    };
    const result = staticContentReducer(undefined, storeStatusOptions(MOCK.STATUS_OPTIONS));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_REGION_OPTIONS", () => {
    const expectedValue = {
      mineStatusOptions: [],
      mineRegionOptions: MOCK.REGION_OPTIONS.options,
      mineDisturbanceOptions: [],
      expectedDocumentStatusOptions: [],
      mineTSFRequiredReports: [],
      mineTenureTypes: [],
    };
    const result = staticContentReducer(undefined, storeRegionOptions(MOCK.REGION_OPTIONS));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_DOCUMENT_STATUS_OPTIONS", () => {
    const expectedValue = {
      mineStatusOptions: [],
      mineRegionOptions: [],
      mineDisturbanceOptions: [],
      expectedDocumentStatusOptions: MOCK.EXPECTED_DOCUMENT_STATUS_OPTIONS.options,
      mineTSFRequiredReports: [],
      mineTenureTypes: [],
    };
    const result = staticContentReducer(
      undefined,
      storeDocumentStatusOptions(MOCK.EXPECTED_DOCUMENT_STATUS_OPTIONS)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINE_TSF_REQUIRED_DOCUMENTS", () => {
    const expectedValue = {
      mineStatusOptions: [],
      mineRegionOptions: [],
      mineDisturbanceOptions: [],
      expectedDocumentStatusOptions: [],
      mineTSFRequiredReports: MOCK.MINE_TSF_REQUIRED_REPORTS,
      mineTenureTypes: [],
    };
    const result = staticContentReducer(
      undefined,
      storeMineTSFRequiredDocuments(MOCK.MINE_TSF_REQUIRED_REPORTS_RESPONSE)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_TENURE_TYPES", () => {
    const expectedValue = {
      mineStatusOptions: [],
      mineRegionOptions: [],
      mineDisturbanceOptions: [],
      mineTSFRequiredReports: [],
      expectedDocumentStatusOptions: [],
      mineTenureTypes: MOCK.TENURE_TYPES.options,
    };
    const result = staticContentReducer(undefined, storeTenureTypes(MOCK.TENURE_TYPES));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_DISTURBANCE_OPTIONS", () => {
    const expectedValue = {
      mineStatusOptions: [],
      mineRegionOptions: [],
      mineDisturbanceOptions: MOCK.DISTURBANCE_OPTIONS,
      mineTSFRequiredReports: [],
      expectedDocumentStatusOptions: [],
      mineTenureTypes: [],
    };
    const result = staticContentReducer(
      undefined,
      storeDisturbanceOptions(MOCK.DISTURBANCE_OPTIONS)
    );
    expect(result).toEqual(expectedValue);
  });
});

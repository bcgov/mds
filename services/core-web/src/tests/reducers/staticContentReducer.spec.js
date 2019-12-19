import staticContentReducer from "@/reducers/staticContentReducer";
import {
  storeStatusOptions,
  storeRegionOptions,
  storeTenureTypes,
  storeDisturbanceOptions,
  storeCommodityOptions,
  storeProvinceCodes,
  storeComplianceCodes,
  storeVarianceStatusOptions,
  storeVarianceDocumentCategoryOptions,
  storeNoticeOfWorkActivityTypeOptions,
  storeNoticeOfWorkUnitTypeOptions,
  storeNoticeOfWorkApplicationTypeOptions,
  storeNoticeOfWorkApplicationStatusOptions,
  storeNoticeOfWorkApplicationDocumentTypeOptions,
  storeNoticeOfWorkUndergroundExplorationTypeOptions,
  storeNoticeOfWorkApplicationProgressStatusCodeOptions,
  storeNoticeOfWorkApplicationPermitTypesOptions,
} from "@/actions/staticContentActions";
import * as MOCK from "@/tests/mocks/dataMocks";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const baseExpectedValue = {
  mineStatusOptions: [],
  mineRegionOptions: [],
  mineDisturbanceOptions: [],
  mineTenureTypes: [],
  mineCommodityOptions: [],
  provinceOptions: [],
  permitStatusCodes: [],
  complianceCodes: [],
  incidentFollowupActionOptions: [],
  incidentDeterminationOptions: [],
  incidentStatusCodeOptions: [],
  incidentCategoryCodeOptions: [],
  varianceStatusOptions: [],
  varianceDocumentCategoryOptions: [],
  mineReportDefinitionOptions: [],
  mineReportStatusOptions: [],
  noticeOfWorkActivityTypeOptions: [],
  noticeOfWorkUnitTypeOptions: [],
  noticeOfWorkApplicationTypeOptions: [],
  noticeOfWorkApplicationStatusOptions: [],
  noticeOfWorkApplicationDocumentTypeOptions: [],
  noticeOfWorkUndergroundExplorationTypeOptions: [],
  noticeOfWorkApplicationProgressStatusCodeOptions: [],
  noticeOfWorkApplicationPermitTypeOptions: [],
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

  it("receives STORE_NOTICE_OF_WORK_ACTIVITY_TYPE_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.noticeOfWorkActivityTypeOptions = NOW_MOCK.NOTICE_OF_WORK_ACTIVITY_TYPES.records;
    const result = staticContentReducer(
      undefined,
      storeNoticeOfWorkActivityTypeOptions(NOW_MOCK.NOTICE_OF_WORK_ACTIVITY_TYPES)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_NOTICE_OF_WORK_UNIT_TYPE_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.noticeOfWorkUnitTypeOptions = NOW_MOCK.UNIT_TYPES.records;
    const result = staticContentReducer(
      undefined,
      storeNoticeOfWorkUnitTypeOptions(NOW_MOCK.UNIT_TYPES)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_NOTICE_OF_WORK_APPLICATION_TYPE_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.noticeOfWorkApplicationTypeOptions = NOW_MOCK.APPLICATION_TYPES.records;
    const result = staticContentReducer(
      undefined,
      storeNoticeOfWorkApplicationTypeOptions(NOW_MOCK.APPLICATION_TYPES)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_NOTICE_OF_WORK_APPLICATION_STATUS_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.noticeOfWorkApplicationStatusOptions = NOW_MOCK.APPLICATION_STATUS_CODES.records;
    const result = staticContentReducer(
      undefined,
      storeNoticeOfWorkApplicationStatusOptions(NOW_MOCK.APPLICATION_STATUS_CODES)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_NOTICE_OF_WORK_APPLICATION_DOCUMENT_TYPE_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.noticeOfWorkApplicationDocumentTypeOptions =
      NOW_MOCK.APPLICATION_DOCUMENT_TYPES.records;
    const result = staticContentReducer(
      undefined,
      storeNoticeOfWorkApplicationDocumentTypeOptions(NOW_MOCK.APPLICATION_DOCUMENT_TYPES)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_NOW_UNDERGROUND_EXPLORATION_TYPE_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.noticeOfWorkUndergroundExplorationTypeOptions =
      NOW_MOCK.UNDERGROUND_EXPLORATION_TYPES.records;
    const result = staticContentReducer(
      undefined,
      storeNoticeOfWorkUndergroundExplorationTypeOptions(NOW_MOCK.UNDERGROUND_EXPLORATION_TYPES)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_NOW_APPLICATION_PROGRESS_STATUS_CODES", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.noticeOfWorkApplicationProgressStatusCodeOptions =
      NOW_MOCK.APPLICATION_PROGRESS_STATUS_CODES.records;
    const result = staticContentReducer(
      undefined,
      storeNoticeOfWorkApplicationProgressStatusCodeOptions(
        NOW_MOCK.APPLICATION_PROGRESS_STATUS_CODES
      )
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_NOW_APPLICATION_PERMIT_TYPES", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.noticeOfWorkApplicationPermitTypeOptions =
      NOW_MOCK.APPLICATION_PERMIT_TYPES.records;
    const result = staticContentReducer(
      undefined,
      storeNoticeOfWorkApplicationPermitTypesOptions(NOW_MOCK.APPLICATION_PERMIT_TYPES)
    );
    expect(result).toEqual(expectedValue);
  });
});

import {
  getMineRegionOptions,
  getMineStatusOptions,
  getMineRegionHash,
  getMineTSFRequiredReports,
  getMineTenureTypesHash,
  getMineTenureTypeOptions,
  getMineDisturbanceOptions,
  getMineCommodityOptions,
  getDropdownCommodityOptions,
  getProvinceOptions,
  getDropdownProvinceOptions,
  getComplianceCodes,
  getDropdownHSRCMComplianceCodes,
  getHSRCMComplianceCodesHash,
  getVarianceStatusOptions,
  getVarianceStatusOptionsHash,
  getDropdownVarianceStatusOptions,
} from "@/selectors/staticContentSelectors";
import staticContentReducer from "@/reducers/staticContentReducer";
import {
  storeStatusOptions,
  storeRegionOptions,
  storeMineTSFRequiredDocuments,
  storeTenureTypes,
  storeDisturbanceOptions,
  storeCommodityOptions,
  storeProvinceCodes,
  storeComplianceCodes,
  storeVarianceStatusOptions,
} from "@/actions/staticContentActions";
import { STATIC_CONTENT } from "@/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockState = {
  mineStatusOptions: Mock.STATUS_OPTIONS.options,
  mineRegionOptions: Mock.REGION_OPTIONS.options,
  mineTenureTypes: Mock.TENURE_TYPES,
  expectedDocumentStatusOptions: Mock.EXPECTED_DOCUMENT_STATUS_OPTIONS.options,
  mineTSFRequiredReports: Mock.MINE_TSF_REQUIRED_REPORTS_RESPONSE.required_documents,
  mineDisturbanceOptions: Mock.DISTURBANCE_OPTIONS.options,
  mineCommodityOptions: Mock.COMMODITY_OPTIONS.options,
  provinceOptions: Mock.PROVINCE_OPTIONS.options,
  complianceCodes: Mock.COMPLIANCE_CODES.records,
  varianceStatusOptions: Mock.VARIANCE_STATUS_OPTIONS.records,
};

describe("staticContentSelectors", () => {
  const { mineStatusOptions, mineDisturbanceOptions, mineCommodityOptions } = mockState;
  const { mineTSFRequiredReports, provinceOptions } = mockState;
  let { mineRegionOptions, mineTenureTypes } = mockState;

  it("`getMineStatusOptions` calls `staticContentReducer.getMineStatusOptions`", () => {
    const storeAction = storeStatusOptions(Mock.STATUS_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getMineStatusOptions(localMockState)).toEqual(mineStatusOptions);
  });

  it("`getMineRegionOptions` calls `staticContentReducer.getMineRegionOptions`", () => {
    const storeAction = storeRegionOptions(Mock.REGION_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getMineRegionOptions(localMockState)).toEqual(mineRegionOptions);
  });

  it("`getMineTSFRequiredReports` calls `staticContentReducer.getMineTSFRequiredReports`", () => {
    const storeAction = storeMineTSFRequiredDocuments(Mock.MINE_TSF_REQUIRED_REPORTS_RESPONSE);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getMineTSFRequiredReports(localMockState)).toEqual(mineTSFRequiredReports);
  });

  it("`getMineRegionHash` converts `staticContentReducer.getMineRegionOptions`", () => {
    mineRegionOptions = Mock.REGION_OPTIONS.options;
    const selected = getMineRegionHash.resultFunc(mineRegionOptions);
    expect(selected).toEqual(Mock.REGION_HASH);
  });

  it("`getMineTenureTypesHash` converts `staticContentReducer.getMineTenureTypes`", () => {
    mineTenureTypes = Mock.TENURE_TYPES;
    const selected = getMineTenureTypesHash.resultFunc(mineTenureTypes);
    expect(selected).toEqual(Mock.TENURE_HASH);
  });

  it("`getMineTenureTypeOptions` calls `staticContentReducer.getMineTenureTypeOptions`", () => {
    const storeAction = storeTenureTypes(Mock.TENURE_TYPES_RESPONSE);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getMineTenureTypeOptions(localMockState)).toEqual(mineTenureTypes);
  });

  it("`getMineDisturbanceOptions` calls `staticContentReducer.getMineDisturbanceOptions`", () => {
    const storeAction = storeDisturbanceOptions(Mock.DISTURBANCE_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getMineDisturbanceOptions(localMockState)).toEqual(mineDisturbanceOptions);
  });

  it("`getMineCommodityOptions` calls `staticContentReducer.getMineCommodityOptions`", () => {
    const storeAction = storeCommodityOptions(Mock.COMMODITY_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getMineCommodityOptions(localMockState)).toEqual(mineCommodityOptions);
  });

  it("`getDropdownCommodityOptions` calls `staticContentReducer.getMineCommodityOptions`", () => {
    const storeAction = storeCommodityOptions(Mock.COMMODITY_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    const mockDropdownCommodityOptions = Mock.DROPDOWN_COMMODITY_OPTIONS;
    expect(getDropdownCommodityOptions(localMockState)).toEqual(mockDropdownCommodityOptions);
  });

  it("`getProvinceOptions` calls `staticContentReducer.getProvinceOptions`", () => {
    const storeAction = storeProvinceCodes(Mock.PROVINCE_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getProvinceOptions(localMockState)).toEqual(provinceOptions);
  });

  it("`getDropdownProvinceOptions` calls `staticContentReducer.getProvinceOptions`", () => {
    const storeAction = storeProvinceCodes(Mock.PROVINCE_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    const mockProvinceCodes = Mock.DROPDOWN_PROVINCE_OPTIONS;
    expect(getDropdownProvinceOptions(localMockState)).toEqual(mockProvinceCodes);
  });

  it("`getComplianceCodes` calls `staticContentReducer.getComplianceCodes`", () => {
    const storeAction = storeComplianceCodes(Mock.COMPLIANCE_CODES);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    const mockComplianceCodes = Mock.COMPLIANCE_CODES.records;
    expect(getComplianceCodes(localMockState)).toEqual(mockComplianceCodes);
  });

  it("`getComplianceCodes` calls `staticContentReducer.getComplianceCodes`", () => {
    const storeAction = storeComplianceCodes(Mock.COMPLIANCE_CODES);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    const mockComplianceCodes = Mock.COMPLIANCE_CODES.records;
    expect(getComplianceCodes(localMockState)).toEqual(mockComplianceCodes);
  });

  it("`getDropdownHSRCMComplianceCodes` calls `staticContentReducer.getComplianceCodes`", () => {
    const storeAction = storeComplianceCodes(Mock.COMPLIANCE_CODES);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    const mockComplianceCodesDropdown = Mock.DROPDOWN_HSRCM_CODES;
    expect(getDropdownHSRCMComplianceCodes(localMockState)).toEqual(mockComplianceCodesDropdown);
  });

  it("`getHSRCMComplianceCodesHash` calls `staticContentReducer.getComplianceCodes`", () => {
    const storeAction = storeComplianceCodes(Mock.COMPLIANCE_CODES);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    const mockComplianceCodesHash = Mock.HSRCM_HASH;
    expect(getHSRCMComplianceCodesHash(localMockState)).toEqual(mockComplianceCodesHash);
  });

  it("`getVarianceStatusOptions` calls `staticContentReducer.getComplianceCodes`", () => {
    const storeAction = storeVarianceStatusOptions(Mock.VARIANCE_STATUS_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    const mockVarianceStatusOptions = Mock.VARIANCE_STATUS_OPTIONS.records;
    expect(getVarianceStatusOptions(localMockState)).toEqual(mockVarianceStatusOptions);
  });

  it("`getDropdownVarianceStatusOptions` calls `staticContentReducer.getVarianceStatusOptions`", () => {
    const storeAction = storeVarianceStatusOptions(Mock.VARIANCE_STATUS_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    const mockVarianceStatusOptions = Mock.VARIANCE_DROPDOWN_STATUS_OPTIONS;
    expect(getDropdownVarianceStatusOptions(localMockState)).toEqual(mockVarianceStatusOptions);
  });

  it("`getVarianceStatusOptionsHash` calls `staticContentReducer.getVarianceStatusOptions`", () => {
    const storeAction = storeVarianceStatusOptions(Mock.VARIANCE_STATUS_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    const mockVarianceStatusOptionsHash = Mock.VARIANCE_STATUS_OPTIONS_HASH;
    expect(getVarianceStatusOptionsHash(localMockState)).toEqual(mockVarianceStatusOptionsHash);
  });
});

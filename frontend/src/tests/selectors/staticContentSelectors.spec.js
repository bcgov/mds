import {
  getMineRegionOptions,
  getMineStatusDropDownOptions,
  getMineRegionHash,
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
  getVarianceDocumentCategoryOptionsHash,
  getDropdownVarianceDocumentCategoryOptions,
  getVarianceDocumentCategoryOptions,
  getNoticeOfWorkActivityTypeOptions,
  getDropdownNoticeOfWorkActivityTypeOptions,
} from "@/selectors/staticContentSelectors";
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
} from "@/actions/staticContentActions";
import { STATIC_CONTENT } from "@/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const mockState = {
  mineStatusOptions: Mock.STATUS_OPTIONS.records,
  mineRegionOptions: Mock.REGION_OPTIONS.records,
  mineTenureTypes: Mock.TENURE_TYPES_RESPONSE.records,
  mineDisturbanceOptions: Mock.DISTURBANCE_OPTIONS.records,
  mineCommodityOptions: Mock.COMMODITY_OPTIONS.records,
  provinceOptions: Mock.PROVINCE_OPTIONS.records,
  complianceCodes: Mock.COMPLIANCE_CODES.records,
  varianceStatusOptions: Mock.VARIANCE_STATUS_OPTIONS.records,
  varianceDocumentCategoryOptions: Mock.VARIANCE_DOCUMENT_CATEGORY_OPTIONS.records,
  noticeOfWorkActivityTypeOptions: NOW_MOCK.NOTICE_OF_WORK_ACTIVITY_TYPES.records,
};

describe("staticContentSelectors", () => {
  const {
    mineDisturbanceOptions,
    mineCommodityOptions,
    noticeOfWorkActivityTypeOptions,
  } = mockState;
  const { provinceOptions, varianceDocumentCategoryOptions } = mockState;

  it("`getMineStatusDropDownOptions` calls `staticContentReducer.getMineStatusDropDownOptions`", () => {
    const storeAction = storeStatusOptions(Mock.STATUS_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getMineStatusDropDownOptions(localMockState)).toEqual(Mock.STATUS_OPTIONS_DROPDOWN);
  });

  it("`getMineRegionOptions` calls `staticContentReducer.getMineRegionOptions`", () => {
    const storeAction = storeRegionOptions(Mock.REGION_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getMineRegionOptions(localMockState)).toEqual(mockState.mineRegionOptions);
  });

  it("`getMineRegionHash` converts `staticContentReducer.getMineRegionOptions`", () => {
    const selected = getMineRegionHash.resultFunc(Mock.REGION_DROPDOWN_OPTIONS);
    expect(selected).toEqual(Mock.REGION_HASH);
  });

  it("`getMineTenureTypesHash` converts `staticContentReducer.getMineTenureTypes`", () => {
    const selected = getMineTenureTypesHash.resultFunc(Mock.TENURE_TYPES_DROPDOWN_OPTIONS);
    expect(selected).toEqual(Mock.TENURE_HASH);
  });

  it("`getMineTenureTypeOptions` calls `staticContentReducer.getMineTenureTypeOptions`", () => {
    const storeAction = storeTenureTypes(Mock.TENURE_TYPES_RESPONSE);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getMineTenureTypeOptions(localMockState)).toEqual(mockState.mineTenureTypes);
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

  it("`getVarianceStatusOptions` calls `staticContentReducer.getVarianceStatusOptions`", () => {
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

  it("`getVarianceDocumentCategoryOptions` calls `staticContentReducer.getVarianceStatusOptions`", () => {
    const storeAction = storeVarianceDocumentCategoryOptions(
      Mock.VARIANCE_DOCUMENT_CATEGORY_OPTIONS
    );
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getVarianceDocumentCategoryOptions(localMockState)).toEqual(
      varianceDocumentCategoryOptions
    );
  });

  it("`getDropdownVarianceDocumentCategoryOptions` calls `staticContentReducer.getVarianceStatusOptions`", () => {
    const storeAction = storeVarianceDocumentCategoryOptions(
      Mock.VARIANCE_DOCUMENT_CATEGORY_OPTIONS
    );
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    const mockDropdownVarianceDocumentCategoryOptions =
      Mock.VARIANCE_DOCUMENT_CATEGORY_OPTIONS_DROPDOWN;
    expect(getDropdownVarianceDocumentCategoryOptions(localMockState)).toEqual(
      mockDropdownVarianceDocumentCategoryOptions
    );
  });

  it("`getVarianceDocumentCategoryOptionsHash` calls `staticContentReducer.getVarianceStatusOptions`", () => {
    const storeAction = storeVarianceDocumentCategoryOptions(
      Mock.VARIANCE_DOCUMENT_CATEGORY_OPTIONS
    );
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    const mockVarianceDocumentCategoryOptionsHash = Mock.VARIANCE_DOCUMENT_CATEGORY_OPTIONS_HASH;
    expect(getVarianceDocumentCategoryOptionsHash(localMockState)).toEqual(
      mockVarianceDocumentCategoryOptionsHash
    );
  });

  it("`getNoticeOfWorkActivityTypeOptions` calls `staticContentReducer.getNoticeOfWorkActivityTypeOptions`", () => {
    const storeAction = storeNoticeOfWorkActivityTypeOptions(
      NOW_MOCK.NOTICE_OF_WORK_ACTIVITY_TYPES
    );
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getNoticeOfWorkActivityTypeOptions(localMockState)).toEqual(
      noticeOfWorkActivityTypeOptions
    );
  });
});

it("`getDropdownNoticeOfWorkActivityTypeOptions` calls `staticContentReducer.getNoticeOfWorkActivityTypeOptions`", () => {
  const storeAction = storeNoticeOfWorkActivityTypeOptions(NOW_MOCK.NOTICE_OF_WORK_ACTIVITY_TYPES);
  const storeState = staticContentReducer({}, storeAction);
  const localMockState = {
    [STATIC_CONTENT]: storeState,
  };
  const mockDropdownNOWActivityTypeOptions = NOW_MOCK.DROPDOWN_NOTICE_OF_WORK_ACTIVITY_TYPES;
  expect(getDropdownNoticeOfWorkActivityTypeOptions(localMockState)).toEqual(
    mockDropdownNOWActivityTypeOptions
  );
});

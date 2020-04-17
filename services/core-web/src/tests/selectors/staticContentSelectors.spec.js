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
  getMineReportCategoryOptions,
  getMineReportDefinitionHash,
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
  getNoticeOfWorkActivityTypeOptionsHash,
  getDropdownNoticeOfWorkActivityTypeOptions,
  getNoticeOfWorkUnitTypeOptions,
  getDropdownNoticeOfWorkUnitTypeOptions,
  getNoticeOfWorkUnitTypeOptionsHash,
  getNoticeOfWorkApplicationTypeOptions,
  getDropdownNoticeOfWorkApplicationTypeOptions,
  getNoticeOfWorkApplicationTypeOptionsHash,
  getNoticeOfWorkApplicationStatusOptions,
  getDropdownNoticeOfWorkApplicationStatusOptions,
  getNoticeOfWorkApplicationStatusOptionsHash,
  getNoticeOfWorkApplicationDocumentTypeOptions,
  getNoticeOfWorkUndergroundExplorationTypeOptions,
  getDropdownNoticeOfWorkUndergroundExplorationTypeOptions,
  getNoticeOfWorkUndergroundExplorationTypeOptionsHash,
  getNoticeOfWorkApplicationPermitTypeOptions,
  getDropdownNoticeOfWorkApplicationPermitTypeOptions,
  getBondTypeDropDownOptions,
  getBondStatusDropDownOptions,
  getBondDocumentTypeDropDownOptions,
  getBondTypeOptions,
  getBondStatusOptions,
  getBondDocumentTypeOptions,
  getBondStatusOptionsHash,
  getBondTypeOptionsHash,
  getBondDocumentTypeOptionsHash,
} from "@common/selectors/staticContentSelectors";
import { STATIC_CONTENT } from "@common/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const mockState = {
  [STATIC_CONTENT]: Mock.BULK_STATIC_CONTENT_RESPONSE,
};

describe("staticContentSelectors", () => {
  it("`getMineStatusDropDownOptions` calls `staticContentReducer.getMineStatusDropDownOptions`", () => {
    expect(getMineStatusDropDownOptions(mockState)).toEqual(Mock.STATUS_OPTIONS_DROPDOWN);
  });

  it("`getMineRegionOptions` calls `staticContentReducer.getMineRegionOptions`", () => {
    expect(getMineRegionOptions(mockState)).toEqual(mockState[STATIC_CONTENT].mineRegionOptions);
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
    expect(getMineTenureTypeOptions(mockState)).toEqual(mockState[STATIC_CONTENT].mineTenureTypes);
  });

  it("`getMineDisturbanceOptions` calls `staticContentReducer.getMineDisturbanceOptions`", () => {
    expect(getMineDisturbanceOptions(mockState)).toEqual(
      mockState[STATIC_CONTENT].mineDisturbanceOptions
    );
  });

  it("`getMineCommodityOptions` calls `staticContentReducer.getMineCommodityOptions`", () => {
    expect(getMineCommodityOptions(mockState)).toEqual(
      mockState[STATIC_CONTENT].mineCommodityOptions
    );
  });

  it("`getDropdownCommodityOptions` calls `staticContentReducer.getMineCommodityOptions`", () => {
    expect(getDropdownCommodityOptions(mockState)).toEqual(Mock.DROPDOWN_COMMODITY_OPTIONS);
  });

  it("`getProvinceOptions` calls `staticContentReducer.getProvinceOptions`", () => {
    expect(getProvinceOptions(mockState)).toEqual(mockState[STATIC_CONTENT].provinceOptions);
  });

  it("`getDropdownProvinceOptions` calls `staticContentSelector.getDropdownProvinceOptions`", () => {
    expect(getDropdownProvinceOptions(mockState)).toEqual(Mock.DROPDOWN_PROVINCE_OPTIONS);
  });

  it("`getMineReportCategoryOptions` calls `staticContentReducer.getMineReportCategoryOptions`", () => {
    expect(getMineReportCategoryOptions(mockState)).toEqual(
      mockState[STATIC_CONTENT].mineReportCategoryOptions
    );
  });

  it("`getMineReportDefinitionHash` calls `staticContentReducer.getMineReportDefinitionHash`", () => {
    expect(getMineReportDefinitionHash(mockState)).toEqual(Mock.MINE_REPORT_DEFINITION_HASH);
  });

  it("`getComplianceCodes` calls `staticContentReducer.getComplianceCodes`", () => {
    expect(getComplianceCodes(mockState)).toEqual(mockState[STATIC_CONTENT].complianceCodes);
  });

  it("`getDropdownHSRCMComplianceCodes` calls `staticContentReducer.getComplianceCodes`", () => {
    expect(getDropdownHSRCMComplianceCodes(mockState)).toEqual(Mock.DROPDOWN_HSRCM_CODES);
  });

  it("`getHSRCMComplianceCodesHash` calls `staticContentReducer.getComplianceCodes`", () => {
    expect(getHSRCMComplianceCodesHash(mockState)).toEqual(Mock.HSRCM_HASH);
  });

  it("`getVarianceStatusOptions` calls `staticContentReducer.getVarianceStatusOptions`", () => {
    expect(getVarianceStatusOptions(mockState)).toEqual(
      mockState[STATIC_CONTENT].varianceStatusOptions
    );
  });

  it("`getDropdownVarianceStatusOptions` calls `staticContentReducer.getVarianceStatusOptions`", () => {
    expect(getDropdownVarianceStatusOptions(mockState)).toEqual(
      Mock.VARIANCE_DROPDOWN_STATUS_OPTIONS
    );
  });

  it("`getVarianceStatusOptionsHash` calls `staticContentReducer.getVarianceStatusOptions`", () => {
    expect(getVarianceStatusOptionsHash(mockState)).toEqual(Mock.VARIANCE_STATUS_OPTIONS_HASH);
  });

  it("`getVarianceDocumentCategoryOptions` calls `staticContentReducer.getVarianceStatusOptions`", () => {
    expect(getVarianceDocumentCategoryOptions(mockState)).toEqual(
      mockState[STATIC_CONTENT].varianceDocumentCategoryOptions
    );
  });

  it("`getDropdownVarianceDocumentCategoryOptions` calls `staticContentReducer.getVarianceStatusOptions`", () => {
    expect(getDropdownVarianceDocumentCategoryOptions(mockState)).toEqual(
      Mock.VARIANCE_DOCUMENT_CATEGORY_OPTIONS_DROPDOWN
    );
  });

  it("`getVarianceDocumentCategoryOptionsHash` calls `staticContentReducer.getVarianceStatusOptions`", () => {
    expect(getVarianceDocumentCategoryOptionsHash(mockState)).toEqual(
      Mock.VARIANCE_DOCUMENT_CATEGORY_OPTIONS_HASH
    );
  });

  it("`getNoticeOfWorkActivityTypeOptions` calls `staticContentReducer.getNoticeOfWorkActivityTypeOptions`", () => {
    expect(getNoticeOfWorkActivityTypeOptions(mockState)).toEqual(
      mockState[STATIC_CONTENT].noticeOfWorkActivityTypeOptions
    );
  });

  it("`getDropdownNoticeOfWorkActivityTypeOptions` calls `staticContentReducer.getNoticeOfWorkActivityTypeOptions`", () => {
    expect(getDropdownNoticeOfWorkActivityTypeOptions(mockState)).toEqual(
      NOW_MOCK.DROPDOWN_NOTICE_OF_WORK_ACTIVITY_TYPES
    );
  });

  it("`getNoticeOfWorkActivityTypeOptionsHash` calls `staticContentReducer.getNoticeOfWorkActivityTypeOptions`", () => {
    expect(getNoticeOfWorkActivityTypeOptionsHash(mockState)).toEqual(NOW_MOCK.ACTIVITY_TYPE_HASH);
  });

  it("`getNoticeOfWorkUnitTypeOptions` calls `staticContentReducer.getNoticeOfWorkUnitTypeOptions`", () => {
    expect(getNoticeOfWorkUnitTypeOptions(mockState)).toEqual(
      mockState[STATIC_CONTENT].noticeOfWorkUnitTypeOptions
    );
  });

  it("`getDropdownNoticeOfWorkUnitTypeOptions` calls `staticContentReducer.getNoticeOfWorkUnitTypeOptions`", () => {
    expect(getDropdownNoticeOfWorkUnitTypeOptions(mockState)).toEqual(NOW_MOCK.DROPDOWN_UNIT_TYPES);
  });

  it("`getNoticeOfWorkUnitTypeOptionsHash` calls `staticContentReducer.getNoticeOfWorkUnitTypeOptions`", () => {
    expect(getNoticeOfWorkUnitTypeOptionsHash(mockState)).toEqual(NOW_MOCK.UNIT_TYPES_HASH);
  });

  it("`getNoticeOfWorkApplicationTypeOptions` calls `staticContentReducer.getNoticeOfWorkApplicationTypeOptions`", () => {
    expect(getNoticeOfWorkApplicationTypeOptions(mockState)).toEqual(
      mockState[STATIC_CONTENT].noticeOfWorkApplicationTypeOptions
    );
  });

  it("`getDropdownNoticeOfWorkUnitTypeOptions` calls `staticContentReducer.getNoticeOfWorkApplicationTypeOptions`", () => {
    expect(getDropdownNoticeOfWorkApplicationTypeOptions(mockState)).toEqual(
      NOW_MOCK.DROPDOWN_APPLICATION_TYPES
    );
  });

  it("`getNoticeOfWorkUnitTypeOptionsHash` calls `staticContentReducer.getNoticeOfWorkApplicationTypeOptions`", () => {
    expect(getNoticeOfWorkApplicationTypeOptionsHash(mockState)).toEqual(
      NOW_MOCK.APPLICATION_TYPES_HASH
    );
  });

  it("`getNoticeOfWorkApplicationStatusOptions` calls `staticContentReducer.getNoticeOfWorkApplicationStatusOptions`", () => {
    expect(getNoticeOfWorkApplicationStatusOptions(mockState)).toEqual(
      mockState[STATIC_CONTENT].noticeOfWorkApplicationStatusOptions
    );
  });

  it("`getDropdownNoticeOfWorkApplicationStatusOptions` calls `staticContentReducer.getNoticeOfWorkApplicationStatusOptions`", () => {
    expect(getDropdownNoticeOfWorkApplicationStatusOptions(mockState)).toEqual(
      NOW_MOCK.DROPDOWN_APPLICATION_STATUS_CODES
    );
  });

  it("`getNoticeOfWorkApplicationStatusOptionsHash` calls `staticContentReducer.getNoticeOfWorkApplicationStatusOptions`", () => {
    expect(getNoticeOfWorkApplicationStatusOptionsHash(mockState)).toEqual(
      NOW_MOCK.APPLICATION_STATUS_CODES_HASH
    );
  });

  it("`getNoticeOfWorkApplicationDocumentTypeOptions` calls `staticContentReducer.getNoticeOfWorkApplicationDocumentTypeOptions`", () => {
    expect(getNoticeOfWorkApplicationDocumentTypeOptions(mockState)).toEqual(
      mockState[STATIC_CONTENT].noticeOfWorkApplicationDocumentTypeOptions
    );
  });

  it("`getNoticeOfWorkUndergroundExplorationTypeOptions` calls `staticContentReducer.getNoticeOfWorkUndergroundExplorationTypeOptions`", () => {
    expect(getNoticeOfWorkUndergroundExplorationTypeOptions(mockState)).toEqual(
      mockState[STATIC_CONTENT].noticeOfWorkUndergroundExplorationTypeOptions
    );
  });

  it("`getDropdownNoticeOfWorkApplicationStatusOptions` calls `staticContentReducer.getNoticeOfWorkUndergroundExplorationTypeOptions`", () => {
    expect(getDropdownNoticeOfWorkUndergroundExplorationTypeOptions(mockState)).toEqual(
      NOW_MOCK.DROPDOWN_UNDERGROUND_EXPLORATION_TYPES
    );
  });

  it("`getNoticeOfWorkApplicationStatusOptionsHash` calls `staticContentReducer.getNoticeOfWorkUndergroundExplorationTypeOptions`", () => {
    expect(getNoticeOfWorkUndergroundExplorationTypeOptionsHash(mockState)).toEqual(
      NOW_MOCK.UNDERGROUND_EXPLORATION_TYPES_HASH
    );
  });

  it("`getNoticeOfWorkApplicationPermitTypeOptions` calls `staticContentReducer.getNoticeOfWorkApplicationPermitTypeOptions`", () => {
    expect(getNoticeOfWorkApplicationPermitTypeOptions(mockState)).toEqual(
      mockState[STATIC_CONTENT].noticeOfWorkApplicationPermitTypeOptions
    );
  });

  it("`getDropdownNoticeOfWorkApplicationPermitTypeOptions` calls `staticContentReducer.getNoticeOfWorkApplicationPermitTypeOptions`", () => {
    expect(getDropdownNoticeOfWorkApplicationPermitTypeOptions(mockState)).toEqual(
      NOW_MOCK.DROPDOWN_APPLICATION_PERMIT_TYPES
    );
  });

  it("`getBondTypeOptions` calls `staticContentReducer.getBondTypeOptions`", () => {
    expect(getBondTypeOptions(mockState)).toEqual(mockState[STATIC_CONTENT].bondTypeOptions);
  });

  it("`getBondTypeDropDownOptions` calls `staticContentReducer.getBondTypeOptions`", () => {
    expect(getBondTypeDropDownOptions(mockState)).toEqual(Mock.DROPDOWN_BOND_TYPE_OPTIONS);
  });

  it("`getBondTypeOptionsHash` calls `staticContentReducer.getBondTypeDropDownOptions`", () => {
    expect(getBondTypeOptionsHash(mockState)).toEqual(Mock.BOND_TYPE_OPTIONS_HASH);
  });

  it("`getBondStatusOptions` calls `staticContentReducer.getBondStatusOptions`", () => {
    expect(getBondStatusOptions(mockState)).toEqual(mockState[STATIC_CONTENT].bondStatusOptions);
  });

  it("`getBondStatusDropDownOptions` calls `staticContentReducer.getBondStatusOptions`", () => {
    expect(getBondStatusDropDownOptions(mockState)).toEqual(Mock.DROPDOWN_BOND_STATUS_OPTIONS);
  });

  it("`getBondStatusOptionsHash` calls `staticContentReducer.getBondStatusDropDownOptions`", () => {
    expect(getBondStatusOptionsHash(mockState)).toEqual(Mock.BOND_STATUS_OPTIONS_HASH);
  });

  it("`getBondDocumentTypeOptions` calls `staticContentReducer.getBondDocumentTypeOptions`", () => {
    expect(getBondDocumentTypeOptions(mockState)).toEqual(
      mockState[STATIC_CONTENT].bondDocumentTypeOptions
    );
  });

  it("`getBondDocumentTypeDropDownOptions` calls `staticContentReducer.getBondDocumentTypeOptions`", () => {
    expect(getBondDocumentTypeDropDownOptions(mockState)).toEqual(
      Mock.DROPDOWN_BOND_DOCUMENT_TYPE_OPTIONS
    );
  });

  it("`getBondDocumentTypeOptionsHash` calls `staticContentReducer.getBondDocumentTypeDropDownOptions`", () => {
    expect(getBondDocumentTypeOptionsHash(mockState)).toEqual(Mock.BOND_DOCUMENT_TYPE_OPTIONS_HASH);
  });
});

import {
  getMineVariances,
  getComplianceCodes,
  getVarianceStatusOptions,
  getDropdownHSRCMComplianceCodes,
  getDropdownVarianceStatusOptions,
  getHSRCMComplianceCodesHash,
  getVarianceStatusOptionsHash,
  getVariance,
} from "@/selectors/varianceSelectors";
import varianceReducer from "@/reducers/varianceReducer";
import {
  storeVariances,
  storeVarianceStatusOptions,
  storeComplianceCodes,
  storeVariance,
} from "@/actions/varianceActions";
import { VARIANCES } from "@/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockState = {
  mineVariances: Mock.VARIANCES.records,
  complianceCodes: Mock.COMPLIANCE_CODES.records,
  varianceStatusOptions: Mock.VARIANCE_STATUS_OPTIONS.records,
  variance: Mock.VARIANCE,
};

describe("varianceSelectors", () => {
  const { mineVariances, variance } = mockState;

  it("`getMineVariances` calls `varianceReducer.getMineVariances`", () => {
    const storeAction = storeVariances(Mock.VARIANCES);
    const storeState = varianceReducer({}, storeAction);
    const localMockState = {
      [VARIANCES]: storeState,
    };
    expect(getMineVariances(localMockState)).toEqual(mineVariances);
  });

  it("`getVariance` calls `varianceReducer.getMineVariances`", () => {
    const storeAction = storeVariance(Mock.VARIANCE);
    const storeState = varianceReducer({}, storeAction);
    const localMockState = {
      [VARIANCES]: storeState,
    };
    expect(getVariance(localMockState)).toEqual(variance);
  });

  it("`getComplianceCodes` calls `varianceReducer.getComplianceCodes`", () => {
    const storeAction = storeComplianceCodes(Mock.COMPLIANCE_CODES);
    const storeState = varianceReducer({}, storeAction);
    const localMockState = {
      [VARIANCES]: storeState,
    };
    const mockComplianceCodes = Mock.COMPLIANCE_CODES.records;
    expect(getComplianceCodes(localMockState)).toEqual(mockComplianceCodes);
  });

  it("`getDropdownHSRCMComplianceCodes` calls `varianceReducer.getComplianceCodes`", () => {
    const storeAction = storeComplianceCodes(Mock.COMPLIANCE_CODES);
    const storeState = varianceReducer({}, storeAction);
    const localMockState = {
      [VARIANCES]: storeState,
    };
    const mockComplianceCodesDropdown = Mock.DROPDOWN_HSRCM_CODES;
    expect(getDropdownHSRCMComplianceCodes(localMockState)).toEqual(mockComplianceCodesDropdown);
  });

  it("`getHSRCMComplianceCodesHash` calls `varianceReducer.getComplianceCodes`", () => {
    const storeAction = storeComplianceCodes(Mock.COMPLIANCE_CODES);
    const storeState = varianceReducer({}, storeAction);
    const localMockState = {
      [VARIANCES]: storeState,
    };
    const mockComplianceCodesHash = Mock.HSRCM_HASH;
    expect(getHSRCMComplianceCodesHash(localMockState)).toEqual(mockComplianceCodesHash);
  });

  it("`getVarianceStatusOptions` calls `varianceReducer.getVarianceStatusOptions`", () => {
    const storeAction = storeVarianceStatusOptions(Mock.VARIANCE_STATUS_OPTIONS);
    const storeState = varianceReducer({}, storeAction);
    const localMockState = {
      [VARIANCES]: storeState,
    };
    const mockVarianceStatusOptions = Mock.VARIANCE_STATUS_OPTIONS.records;
    expect(getVarianceStatusOptions(localMockState)).toEqual(mockVarianceStatusOptions);
  });

  it("`getDropdownVarianceStatusOptions` calls `varianceReducer.getVarianceStatusOptions`", () => {
    const storeAction = storeVarianceStatusOptions(Mock.VARIANCE_STATUS_OPTIONS);
    const storeState = varianceReducer({}, storeAction);
    const localMockState = {
      [VARIANCES]: storeState,
    };
    const mockVarianceStatusOptions = Mock.VARIANCE_DROPDOWN_STATUS_OPTIONS;
    expect(getDropdownVarianceStatusOptions(localMockState)).toEqual(mockVarianceStatusOptions);
  });

  it("`getVarianceStatusOptionsHash` calls `varianceReducer.getVarianceStatusOptions`", () => {
    const storeAction = storeVarianceStatusOptions(Mock.VARIANCE_STATUS_OPTIONS);
    const storeState = varianceReducer({}, storeAction);
    const localMockState = {
      [VARIANCES]: storeState,
    };
    const mockVarianceStatusOptionsHash = Mock.VARIANCE_STATUS_OPTIONS_HASH;
    expect(getVarianceStatusOptionsHash(localMockState)).toEqual(mockVarianceStatusOptionsHash);
  });
});

import { getMineComplianceInfo } from "@common/selectors/complianceSelectors";
import { complianceReducer } from "@common/reducers/complianceReducer";
import { storeMineComplianceInfo } from "@common/actions/complianceActions";
import { COMPLIANCE } from "@common/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockResponse = Mock.COMPLIANCE;
const mockState = {
  mineComplianceInfo: Mock.COMPLIANCE,
};

describe("complianceSelectors", () => {
  const { mineComplianceInfo } = mockState;

  it("`getMineComplianceInfo` calls `complianceReducer.getMineComplianceInfo`", () => {
    const storeAction = storeMineComplianceInfo(mockResponse);
    const storeState = complianceReducer({}, storeAction);
    const localMockState = {
      [COMPLIANCE]: storeState,
    };
    expect(getMineComplianceInfo(localMockState)).toEqual(mineComplianceInfo);
  });
});

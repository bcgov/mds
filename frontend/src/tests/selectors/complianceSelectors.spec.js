import { getMineComplianceInfo } from "@/selectors/complianceSelectors";
import complianceReducer from "@/reducers/complianceReducer";
import { storeMineComplianceInfo } from "@/actions/complianceActions";
import { COMPLIANCE } from "@/constants/reducerTypes";
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
    const mockState = {
      [COMPLIANCE]: storeState,
    };
    expect(getMineComplianceInfo(mockState)).toEqual(mineComplianceInfo);
  });
});

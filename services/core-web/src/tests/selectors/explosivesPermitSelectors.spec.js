import { getExplosivesPermits } from "@common/selectors/explosivesPermitSelectors";
import { explosivesPermitReducer } from "@common/reducers/explosivesPermitReducer";
import { storeExplosivesPermits } from "@common/actions/explosivesPermitActions";
import { EXPLOSIVES_PERMITS } from "@common/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockResponse = Mock.EXPLOSIVES_PERMITS.data;
const mockState = {
  explosivesPermits: Mock.EXPLOSIVES_PERMITS.data.records,
};

describe("complianceSelectors", () => {
  const { explosivesPermits } = mockState;

  it("`getExplosivesPermits` calls `explosivesPermitReducer.getExplosivesPermits`", () => {
    const storeAction = storeExplosivesPermits(mockResponse);
    const storeState = explosivesPermitReducer({}, storeAction);
    const localMockState = {
      [EXPLOSIVES_PERMITS]: storeState,
    };
    expect(getExplosivesPermits(localMockState)).toEqual(explosivesPermits);
  });
});

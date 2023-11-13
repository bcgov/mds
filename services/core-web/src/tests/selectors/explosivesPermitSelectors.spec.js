import { getExplosivesPermits } from "@mds/common/redux/selectors/explosivesPermitSelectors";
import { explosivesPermitReducer } from "@mds/common/redux/reducers/explosivesPermitReducer";
import { storeExplosivesPermits } from "@mds/common/redux/actions/explosivesPermitActions";
import { EXPLOSIVES_PERMITS } from "@mds/common/constants/reducerTypes";
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

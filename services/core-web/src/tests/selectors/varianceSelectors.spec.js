import { getVariances, getVariance } from "@common/selectors/varianceSelectors";
import { varianceReducer } from "@common/reducers/varianceReducer";
import { storeVariances, storeVariance } from "@common/actions/varianceActions";
import { VARIANCES } from "@common/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockState = {
  mineVariances: Mock.VARIANCES.records,
  variance: Mock.VARIANCE,
};

describe("varianceSelectors", () => {
  const { mineVariances, variance } = mockState;

  it("`getVariances` calls `varianceReducer.getVariances`", () => {
    const storeAction = storeVariances(Mock.VARIANCES);
    const storeState = varianceReducer({}, storeAction);
    const localMockState = {
      [VARIANCES]: storeState,
    };
    expect(getVariances(localMockState)).toEqual(mineVariances);
  });

  it("`getVariance` calls `varianceReducer.getVariance`", () => {
    const storeAction = storeVariance(Mock.VARIANCE);
    const storeState = varianceReducer({}, storeAction);
    const localMockState = {
      [VARIANCES]: storeState,
    };
    expect(getVariance(localMockState)).toEqual(variance);
  });
});

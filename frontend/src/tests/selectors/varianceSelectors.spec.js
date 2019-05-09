import { getMineVariances } from "@/selectors/varianceSelectors";
import varianceReducer from "@/reducers/varianceReducer";
import { storeVariances } from "@/actions/varianceActions";
import { VARIANCES } from "@/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockState = {
  mineVariances: Mock.VARIANCES.records,
};

describe("varianceSelectors", () => {
  const { mineVariances } = mockState;

  it("`getMineVariances` calls `staticContentReducer.getMineVariances`", () => {
    const storeAction = storeVariances(Mock.VARIANCES);
    const storeState = varianceReducer({}, storeAction);
    const localMockState = {
      [VARIANCES]: storeState,
    };
    expect(getMineVariances(localMockState)).toEqual(mineVariances);
  });
});

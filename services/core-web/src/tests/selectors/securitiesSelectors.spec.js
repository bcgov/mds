import { getBonds, getBondTotals } from "@common/selectors/securitiesSelectors";
import { securitiesReducer } from "@common/reducers/securitiesReducer";
import { storeMineBonds } from "@common/actions/securitiesActions";
import { SECURITIES } from "@common/constants/reducerTypes";
import * as MOCK from "@/tests/mocks/dataMocks";

const mockState = {
  bonds: MOCK.BONDS.records,
};

describe("userSelectors", () => {
  const { bonds } = mockState;

  it("`getBonds` calls `userReducer.getBonds`", () => {
    const storeAction = storeMineBonds(MOCK.BONDS);
    const storeState = securitiesReducer({}, storeAction);
    const localMockState = {
      [SECURITIES]: storeState,
    };
    expect(getBonds(localMockState)).toEqual(bonds);
  });

  it("`getBondTotals` calls `partiesReducer.getBonds`", () => {
    const storeAction = storeMineBonds(MOCK.BONDS);
    const storeState = securitiesReducer({}, storeAction);
    const localMockState = {
      [SECURITIES]: storeState,
    };

    expect(getBondTotals(localMockState)).toEqual({
      amountHeld: 300,
      count: 1,
    });
  });
});

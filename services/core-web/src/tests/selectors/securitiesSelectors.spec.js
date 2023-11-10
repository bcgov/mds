import {
  getBonds,
  getBondTotals,
  getReclamationInvoices,
} from "@mds/common/redux/selectors/securitiesSelectors";
import { securitiesReducer } from "@mds/common/redux/reducers/securitiesReducer";
import { storeMineBonds, storeMineReclamationInvoices } from "@mds/common/redux/actions/securitiesActions";
import { SECURITIES } from "@common/constants/reducerTypes";
import * as MOCK from "@/tests/mocks/dataMocks";

const mockState = {
  bonds: MOCK.BONDS.records,
  reclamationInvoices: MOCK.RECLAMATION_INVOICES.records,
};

describe("userSelectors", () => {
  const { bonds, reclamationInvoices } = mockState;

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
      amountHeld: 1200,
      count: 2,
    });
  });

  it("`getReclamationInvoices` calls `userReducer.getReclamationInvoices`", () => {
    const storeAction = storeMineReclamationInvoices(MOCK.RECLAMATION_INVOICES);
    const storeState = securitiesReducer({}, storeAction);
    const localMockState = {
      [SECURITIES]: storeState,
    };
    expect(getReclamationInvoices(localMockState)).toEqual(reclamationInvoices);
  });
});

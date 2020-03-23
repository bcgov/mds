/* eslint-disable */
import { createSelector } from "reselect";
import * as securitiesReducer from "../reducers/securitiesReducer";
import * as permitReducer from "../reducers/permitReducer";

export const { getBonds, getBond } = securitiesReducer;
const { getPermits } = permitReducer;

export const getBondTotals = createSelector([getBonds, getPermits], (bonds, permits) => {
  const getSum = (status) =>
    bonds
      .filter(({ bond_status_code }) => {
        bond_status_code === status;
      })
      .reduce((a, b) => a + (b.amount || 0), 0);
  return {
    amountHeld: getSum("ACT"),
    count: bonds.length,
  };
});

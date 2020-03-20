import { createSelector } from "reselect";
import * as securitiesReducer from "../reducers/securitiesReducer";

export const { getBonds, getBond } = securitiesReducer;

export const getBondTotals = createSelector([getBonds], (bonds) => {
  return {
    amountHeld: 10000,
    amountConfiscated: 1000,
    count: bonds.length,
  };
});

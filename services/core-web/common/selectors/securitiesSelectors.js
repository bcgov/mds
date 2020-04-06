import { createSelector } from "reselect";
import * as securitiesReducer from "../reducers/securitiesReducer";

export const { getBonds, getReclamationInvoices } = securitiesReducer;

export const getBondTotals = createSelector([getBonds], (bonds) => {
  const getSum = () =>
    bonds
      .filter(({ bond_status_code }) => bond_status_code === "ACT")
      .reduce((sum, bond) => +sum + +bond.amount, 0);
  const getActiveCount = () =>
    bonds.filter(({ bond_status_code }) => bond_status_code === "ACT").length;
  return {
    amountHeld: getSum(),
    count: getActiveCount(),
  };
});

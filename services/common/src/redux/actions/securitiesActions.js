import * as ActionTypes from "@common/constants/actionTypes";

export const storeMineBonds = (payload) => ({
  type: ActionTypes.STORE_MINE_BONDS,
  payload,
});

export const storeMineReclamationInvoices = (payload) => ({
  type: ActionTypes.STORE_MINE_RECLAMATION_INVOICES,
  payload,
});

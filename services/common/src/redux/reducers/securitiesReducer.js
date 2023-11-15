import * as actionTypes from "@mds/common/constants/actionTypes";
import { SECURITIES } from "@mds/common/constants/reducerTypes";

const initialState = {
  bonds: [],
  reclamationInvoices: [],
};

export const securitiesReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINE_BONDS:
      return {
        ...state,
        bonds: action.payload.records,
      };
    case actionTypes.STORE_MINE_RECLAMATION_INVOICES:
      return {
        ...state,
        reclamationInvoices: action.payload.records,
      };
    default:
      return state;
  }
};

const securitiesReducerObject = {
  [SECURITIES]: securitiesReducer,
};

export const getBonds = (state) => state[SECURITIES].bonds;
export const getReclamationInvoices = (state) => state[SECURITIES].reclamationInvoices;

export default securitiesReducerObject;

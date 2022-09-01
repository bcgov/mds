import { STORE_TAILINGS_STORAGE_FACILITY } from "../constants/actionTypes";

// eslint-disable-next-line import/prefer-default-export
export const storeTsf = (payload) => ({
  type: STORE_TAILINGS_STORAGE_FACILITY,
  payload,
});

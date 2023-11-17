import {
  STORE_TAILINGS_STORAGE_FACILITY,
  CLEAR_TAILINGS_STORAGE_FACILITY,
} from "@mds/common/constants/actionTypes";

export const storeTsf = (payload) => ({
  type: STORE_TAILINGS_STORAGE_FACILITY,
  payload,
});

export const clearTsf = () => ({
  type: CLEAR_TAILINGS_STORAGE_FACILITY,
});

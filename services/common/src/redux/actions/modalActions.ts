/**
 * @file modalActions.ts
 *
 * Contains actions relevant to opening/closing Modals.
 */

import * as actionTypes from "@mds/common/constants/actionTypes";

export const openModal = (payload: unknown) => ({
  type: actionTypes.OPEN_MODAL,
  payload,
});

export const closeModal = () => ({
  type: actionTypes.CLOSE_MODAL,
});

export const changeModalTitle = (payload: unknown) => ({
  type: actionTypes.UPDATE_MODAL_TITLE,
  payload,
});

export const setIsFormLoading = (payload: boolean) => ({
  type: actionTypes.STORE_IS_LOADING,
  payload,
});

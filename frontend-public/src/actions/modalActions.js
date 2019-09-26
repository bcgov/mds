/**
 * @file modalActions.js
 *
 * Contains actions relevant to opening/closing Modals.
 */

import * as actionTypes from "@/constants/actionTypes";

export const changeModalTitle = (payload) => ({
  type: actionTypes.CHANGE_MODAL_TITLE,
  payload,
});

export const openModal = (payload) => ({
  type: actionTypes.OPEN_MODAL,
  payload,
});

export const closeModal = () => ({
  type: actionTypes.CLOSE_MODAL,
});

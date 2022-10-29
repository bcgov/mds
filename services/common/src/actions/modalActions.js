/**
 * @file modalActions.js
 *
 * Contains actions relevant to opening/closing Modals.
 */

import * as actionTypes from "../constants/actionTypes";

export const openModal = (payload) => ({
  type: actionTypes.OPEN_MODAL,
  payload,
});

export const closeModal = () => ({
  type: actionTypes.CLOSE_MODAL,
});

export const changeModalTitle = (payload) => ({
  type: actionTypes.UPDATE_MODAL_TITLE,
  payload,
});

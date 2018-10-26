/**
* @file modalActions.js
*
* Contains actions relevant to opening/closing Modals.
*/

import * as actionTypes from '@/constants/actionTypes';

export const openModal = (payload) => {
  return {
    type: actionTypes.OPEN_MODAL,
    payload
  };
};

export const closeModal = () => {
  return {
    type: actionTypes.CLOSE_MODAL,
  };
};


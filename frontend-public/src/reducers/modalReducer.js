/**
 * @file modalReducer.js
 *
 * The modalReducer is used for updating the modal state.
 */
import * as actionTypes from "@/constants/actionTypes";
import { MODAL } from "@/constants/reducerTypes";

const initialState = {
  isModalOpen: false,
  props: {},
  content: null,
  clearOnSubmit: true,
};

const modalReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.OPEN_MODAL:
      const { props, content, clearOnSubmit = initialState.clearOnSubmit } = action.payload;
      return {
        ...state,
        isModalOpen: true,
        props,
        content,
        clearOnSubmit,
      };
    case actionTypes.CLOSE_MODAL:
      return {
        ...state,
        ...initialState,
      };
    case actionTypes.CHANGE_MODAL_TITLE:
      return {
        ...state,
        props: { ...state.props, title: action.payload },
      };
    default:
      return state;
  }
};

export const getIsModalOpen = (state) => state[MODAL].isModalOpen;
export const getProps = (state) => state[MODAL].props;
export const getContent = (state) => state[MODAL].content;
export const getClearOnSubmit = (state) => state[MODAL].clearOnSubmit;

export default modalReducer;

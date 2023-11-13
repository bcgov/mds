import * as actionTypes from "@mds/common/constants/actionTypes";
import { MODAL } from "@mds/common/constants/reducerTypes";

const initialState = {
  isModalOpen: false,
  props: {},
  content: null,
  clearOnSubmit: true,
  width: 810,
  isViewOnly: false,
};

export const modalReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.OPEN_MODAL:
      const {
        props,
        content,
        width = initialState.width,
        isViewOnly = initialState.isViewOnly,
        clearOnSubmit = initialState.clearOnSubmit,
      } = action.payload;
      return {
        ...state,
        isModalOpen: true,
        props,
        content,
        width,
        isViewOnly,
        clearOnSubmit,
      };
    case actionTypes.CLOSE_MODAL:
      return {
        ...state,
        ...initialState,
      };
    case actionTypes.UPDATE_MODAL_TITLE:
      return {
        ...state,
        props: {
          ...state.props,
          title: action.payload,
        },
      };
    default:
      return state;
  }
};

const modalReducerObject = {
  [MODAL]: modalReducer,
};

export const getIsModalOpen = (state) => state[MODAL].isModalOpen;
export const getProps = (state) => state[MODAL].props;
export const getContent = (state) => state[MODAL].content;
export const getWidth = (state) => state[MODAL].width;
export const getIsViewOnly = (state) => state[MODAL].isViewOnly;
export const getClearOnSubmit = (state) => state[MODAL].clearOnSubmit;

export default modalReducerObject;

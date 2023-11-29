import * as actionTypes from "@mds/common/constants/actionTypes";
import { MODAL } from "@mds/common/constants/reducerTypes";
import { RootState } from "../rootState";

interface IModalReducer {
  isModalOpen: boolean;
  props: any;
  content: any;
  clearOnSubmit: boolean;
  width: number;
  isViewOnly: boolean;
  isLoading: boolean;
}

const initialState: IModalReducer = {
  isModalOpen: false,
  props: {},
  content: null,
  clearOnSubmit: true,
  width: 810,
  isViewOnly: false,
  isLoading: false,
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
        isLoading = initialState.isLoading,
      } = action.payload;
      return {
        ...state,
        isModalOpen: true,
        props,
        content,
        width,
        isViewOnly,
        clearOnSubmit,
        isLoading,
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
    case actionTypes.STORE_FORM_IS_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const modalReducerObject = {
  [MODAL]: modalReducer,
};

export const getIsModalOpen = (state: RootState) => state[MODAL].isModalOpen;
export const getProps = (state: RootState) => state[MODAL].props;
export const getContent = (state: RootState) => state[MODAL].content;
export const getWidth = (state: RootState) => state[MODAL].width;
export const getIsViewOnly = (state: RootState) => state[MODAL].isViewOnly;
export const getClearOnSubmit = (state: RootState) => state[MODAL].clearOnSubmit;
export const getIsFormLoading = (state: RootState) => state[MODAL].isLoading;

export default modalReducerObject;

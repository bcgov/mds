import { STORE_DOCUMENT_CONTEXT_TEMPLATE } from "@/constants/actionTypes";
import { DOCUMENTS } from "@/constants/reducerTypes";

const initialState = {
  contextTemplate: {},
};

const documentReducer = (state = initialState, action) => {
  switch (action.type) {
    case STORE_DOCUMENT_CONTEXT_TEMPLATE:
      return {
        ...state,
        contextTemplate: action.payload,
      };
    default:
      return state;
  }
};

const documentReducerObject = {
  [DOCUMENTS]: documentReducer,
};

export const getDocumentContextTemplate = (state) => state[DOCUMENTS].contextTemplate;

export default documentReducerObject;

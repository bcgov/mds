import { STORE_DOCUMENT_CONTEXT_TEMPLATE, DOCUMENTS } from "@/constants/actionTypes";

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

export const getDocumentContextTemplate = (state) => state[DOCUMENTS].contextTemplate;

export default documentReducer;

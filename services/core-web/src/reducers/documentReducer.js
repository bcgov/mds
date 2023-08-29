import {
  STORE_DOCUMENT_CONTEXT_TEMPLATE,
  STORE_DOCUMENT_COMPRESSION_PROGRESS,
} from "@/constants/actionTypes";
import { DOCUMENTS } from "@/constants/reducerTypes";

const initialState = {
  contextTemplate: {},
  documentCompressionProgress: {},
};

const documentReducer = (state = initialState, action) => {
  switch (action.type) {
    case STORE_DOCUMENT_CONTEXT_TEMPLATE:
      return {
        ...state,
        contextTemplate: action.payload,
      };
    case STORE_DOCUMENT_COMPRESSION_PROGRESS:
      return {
        ...state,
        documentCompressionProgress: {},
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

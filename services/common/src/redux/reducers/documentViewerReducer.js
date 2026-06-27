import * as actionTypes from "@mds/common/constants/actionTypes";
import { DOCUMENT_VIEWER } from "@mds/common/constants/reducerTypes";

const initialState = {
  isDocumentViewerOpen: false,
  props: { title: "Document Viewer" },
  location: null,
};

export const documentViewerReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.OPEN_DOCUMENT_VIEWER:
      const { props, documentPath, documentName, location = null } = action.payload;
      return {
        ...state,
        documentPath,
        documentName,
        isDocumentViewerOpen: true,
        props,
        location,
      };
    case actionTypes.CLOSE_DOCUMENT_VIEWER:
      return {
        ...state,
        ...initialState,
      };
    case actionTypes.UPDATE_DOCUMENT_VIEWER_TITLE:
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

const documentViewerReducerObject = {
  [DOCUMENT_VIEWER]: documentViewerReducer,
};

export const getDocumentPath = (state) => state[DOCUMENT_VIEWER].documentPath;
export const getDocumentName = (state) => state[DOCUMENT_VIEWER].documentName;
export const getIsDocumentViewerOpen = (state) => state[DOCUMENT_VIEWER].isDocumentViewerOpen;
export const getProps = (state) => state[DOCUMENT_VIEWER].props;
export const getLocation = (state) => state[DOCUMENT_VIEWER].location;

export default documentViewerReducerObject;

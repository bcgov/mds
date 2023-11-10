import * as actionTypes from "../constants/actionTypes";
import { NOTICE_OF_WORK } from "../constants/reducerTypes";

const initialState = {
  noticeOfWorkList: [],
  noticeOfWork: {},
  originalNoticeOfWork: {},
  importNowSubmissionDocumentsJob: {},
  noticeOfWorkPageData: {},
  noticeOfWorkReviews: [],
  documentDownloadState: { downloading: false, currentFile: 1, totalFiles: 1 },
  applicationDelays: [],
};

export const noticeOfWorkReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_NOTICE_OF_WORK_APPLICATIONS:
      return {
        ...state,
        noticeOfWorkList: action.payload.records,
        noticeOfWorkPageData: action.payload,
      };
    case actionTypes.STORE_MINE_NOTICE_OF_WORK_APPLICATIONS:
      return {
        ...state,
        noticeOfWorkList: action.payload.records,
      };
    case actionTypes.STORE_NOTICE_OF_WORK_APPLICATION:
      return {
        ...state,
        noticeOfWork: action.payload,
      };
    case actionTypes.CLEAR_NOTICE_OF_WORK_APPLICATION:
      return {
        ...state,
        noticeOfWork: {},
        originalNoticeOfWork: {},
        importNowSubmissionDocumentsJob: {},
      };
    case actionTypes.STORE_ORIGINAL_NOTICE_OF_WORK_APPLICATION:
      return {
        ...state,
        originalNoticeOfWork: action.payload,
      };
    case actionTypes.STORE_NOTICE_OF_WORK_APPLICATION_REVIEWS:
      return {
        ...state,
        noticeOfWorkReviews: action.payload.records,
      };
    case actionTypes.STORE_NOTICE_OF_WORK_APPLICATION_DOCUMENT_DOWNLOAD_STATE:
      return {
        ...state,
        documentDownloadState: action.payload,
      };
    case actionTypes.STORE_IMPORT_NOTICE_OF_WORK_SUBMISSION_DOCUMENTS_JOB:
      return {
        ...state,
        importNowSubmissionDocumentsJob: action.payload,
      };
    case actionTypes.STORE_NOTICE_OF_WORK_APPLICATION_DELAY:
      return {
        ...state,
        applicationDelays: action.payload.records,
      };
    default:
      return state;
  }
};

const noticeOfWorkReducerObject = {
  [NOTICE_OF_WORK]: noticeOfWorkReducer,
};

export const getNoticeOfWorkList = (state) => state[NOTICE_OF_WORK].noticeOfWorkList;
export const getNoticeOfWorkUnformatted = (state) => state[NOTICE_OF_WORK].noticeOfWork;
export const getOriginalNoticeOfWork = (state) => state[NOTICE_OF_WORK].originalNoticeOfWork;
export const getImportNowSubmissionDocumentsJob = (state) =>
  state[NOTICE_OF_WORK].importNowSubmissionDocumentsJob;
export const getNoticeOfWorkPageData = (state) => state[NOTICE_OF_WORK].noticeOfWorkPageData;
export const getNoticeOfWorkReviews = (state) => state[NOTICE_OF_WORK].noticeOfWorkReviews;
export const getDocumentDownloadState = (state) => state[NOTICE_OF_WORK].documentDownloadState;
export const getApplicationDelays = (state) => state[NOTICE_OF_WORK].applicationDelays;
export default noticeOfWorkReducerObject;

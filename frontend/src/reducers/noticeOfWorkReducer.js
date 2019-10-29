import * as actionTypes from "@/constants/actionTypes";
import { NOTICE_OF_WORK } from "@/constants/reducerTypes";

const initialState = {
  noticeOfWorkList: [],
  noticeOfWork: {},
  noticeOfWorkPageData: {},
};

const noticeOfWorkReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_NOTICE_OF_WORK_APPLICATIONS:
      return {
        ...state,
        noticeOfWorkList: action.payload.records,
        noticeOfWorkPageData: action.payload,
      };
    case actionTypes.STORE_NOTICE_OF_WORK_APPLICATION:
      return {
        ...state,
        noticeOfWork: action.payload,
      };
    default:
      return state;
  }
};

export const getNoticeOfWorkList = (state) => state[NOTICE_OF_WORK].noticeOfWorkList;
export const getNoticeOfWork = (state) => state[NOTICE_OF_WORK].noticeOfWork;
export const getNoticeOfWorkPageData = (state) => state[NOTICE_OF_WORK].noticeOfWorkPageData;

export default noticeOfWorkReducer;

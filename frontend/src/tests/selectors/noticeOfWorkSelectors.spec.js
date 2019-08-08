import { getNoticeOfWorkList, getNoticeOfWork } from "@/selectors/noticeOfWorkSelectors";
import noticeOfWorkReducer from "@/reducers/noticeOfWorkReducer";
import {
  storeNoticeOfWorkApplications,
  storeNoticeOfWorkApplication,
} from "@/actions/noticeOfWorkActions";
import { NOTICE_OF_WORK } from "@/constants/reducerTypes";
import * as Mock from "@/tests/mocks/noticeOfWorkMocks";

const mockState = {
  noticeOfWorkList: Mock.NOTICE_OF_WORK_LIST.records,
  noticeOfWork: Mock.NOTICE_OF_WORK,
};

describe("noticeOfWorkSelectors", () => {
  const { noticeOfWorkList, noticeOfWork } = mockState;

  it("`getNoticeOfWorkList` calls `noticeOfWorkReducer.getNoticeOfWorkList`", () => {
    const storeAction = storeNoticeOfWorkApplications(Mock.NOTICE_OF_WORK_LIST);
    const storeState = noticeOfWorkReducer({}, storeAction);
    const localMockState = {
      [NOTICE_OF_WORK]: storeState,
    };
    expect(getNoticeOfWorkList(localMockState)).toEqual(noticeOfWorkList);
  });

  it("`getNoticeOfWork` calls `noticeOfWorkReducer.getNoticeOfWork`", () => {
    const storeAction = storeNoticeOfWorkApplication(Mock.NOTICE_OF_WORK);
    const storeState = noticeOfWorkReducer({}, storeAction);
    const localMockState = {
      [NOTICE_OF_WORK]: storeState,
    };
    expect(getNoticeOfWork(localMockState)).toEqual(noticeOfWork);
  });
});

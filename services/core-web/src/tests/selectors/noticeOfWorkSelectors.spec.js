import {
  getNoticeOfWorkList,
  getNoticeOfWork,
  getOriginalNoticeOfWork,
} from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { noticeOfWorkReducer } from "@mds/common/redux/reducers/noticeOfWorkReducer";
import {
  storeNoticeOfWorkApplications,
  storeNoticeOfWorkApplication,
  storeOriginalNoticeOfWorkApplication,
} from "@mds/common/redux/actions/noticeOfWorkActions";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";
import * as MOCKS from "@/tests/mocks/noticeOfWorkMocks";

const mockState = {
  noticeOfWorkList: MOCKS.NOTICE_OF_WORK_LIST.records,
  noticeOfWork: MOCKS.NOTICE_OF_WORK,
  originalNoticeOfWork: MOCKS.IMPORTED_NOTICE_OF_WORK,
};

describe("noticeOfWorkSelectors", () => {
  const { noticeOfWorkList, noticeOfWork, originalNoticeOfWork } = mockState;

  it("`getNoticeOfWorkList` calls `noticeOfWorkReducer.getNoticeOfWorkList`", () => {
    const storeAction = storeNoticeOfWorkApplications(MOCKS.NOTICE_OF_WORK_LIST);
    const storeState = noticeOfWorkReducer({}, storeAction);
    const localMockState = {
      [NOTICE_OF_WORK]: storeState,
    };
    expect(getNoticeOfWorkList(localMockState)).toEqual(noticeOfWorkList);
  });

  it("`getNoticeOfWork` calls `noticeOfWorkReducer.getNoticeOfWork`", () => {
    const storeAction = storeNoticeOfWorkApplication(MOCKS.NOTICE_OF_WORK);
    const storeState = noticeOfWorkReducer({}, storeAction);
    const localMockState = {
      [NOTICE_OF_WORK]: storeState,
    };
    expect(getNoticeOfWork(localMockState)).toEqual(noticeOfWork);
  });

  it("`getOriginalNoticeOfWork` calls `noticeOfWorkReducer.getOriginalNoticeOfWork`", () => {
    const storeAction = storeOriginalNoticeOfWorkApplication(MOCKS.IMPORTED_NOTICE_OF_WORK);
    const storeState = noticeOfWorkReducer({}, storeAction);
    const localMockState = {
      [NOTICE_OF_WORK]: storeState,
    };
    expect(getOriginalNoticeOfWork(localMockState)).toEqual(originalNoticeOfWork);
  });
});

import noticeOfWorkReducer from "@/reducers/noticeOfWorkReducer";
import {
  storeNoticeOfWorkSubmissions,
  storeNoticeOfWorkSubmission,
} from "@/actions/noticeOfWorkActions";
import * as MOCK from "@/tests/mocks/noticeOfWorkMocks";

const baseExpectedValue = {
  noticeOfWorkList: [],
  noticeOfWork: {},
  noticeOfWorkPageData: {},
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("noticeOfWorkReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = noticeOfWorkReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_NOTICE_OF_WORK_SUBMISSIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.noticeOfWorkList = MOCK.NOTICE_OF_WORK_LIST.records;
    expectedValue.noticeOfWorkPageData = MOCK.NOTICE_OF_WORK_LIST;
    const result = noticeOfWorkReducer(
      undefined,
      storeNoticeOfWorkSubmissions(MOCK.NOTICE_OF_WORK_LIST)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_NOTICE_OF_WORK_SUBMISSION", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.noticeOfWork = MOCK.NOTICE_OF_WORK;
    const result = noticeOfWorkReducer(undefined, storeNoticeOfWorkSubmission(MOCK.NOTICE_OF_WORK));
    expect(result).toEqual(expectedValue);
  });
});

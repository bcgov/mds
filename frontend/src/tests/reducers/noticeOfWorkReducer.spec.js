import noticeOfWorkReducer from "@/reducers/noticeOfWorkReducer";
import {
  storeNoticeOfWorkApplications,
  storeNoticeOfWorkApplication,
} from "@/actions/noticeOfWorkActions";
import * as MOCK from "@/tests/mocks/noticeOfWorkMocks";

const baseExpectedValue = {
  noticeOfWorkList: [],
  noticeOfWork: {},
  noticeOfWorkPageData: {},
  originalNoticeOfWork: {},
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("noticeOfWorkReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = noticeOfWorkReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_NOTICE_OF_WORK_APPLICATIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.noticeOfWorkList = MOCK.NOTICE_OF_WORK_LIST.records;
    expectedValue.noticeOfWorkPageData = MOCK.NOTICE_OF_WORK_LIST;
    const result = noticeOfWorkReducer(
      undefined,
      storeNoticeOfWorkApplications(MOCK.NOTICE_OF_WORK_LIST)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_NOTICE_OF_WORK_APPLICATION", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.noticeOfWork = MOCK.NOTICE_OF_WORK;
    const result = noticeOfWorkReducer(
      undefined,
      storeNoticeOfWorkApplication(MOCK.NOTICE_OF_WORK)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_ORIGINAL_NOTICE_OF_WORK_APPLICATION", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.noticeOfWork = MOCK.NOTICE_OF_WORK;
    const result = noticeOfWorkReducer(
      undefined,
      storeNoticeOfWorkApplication(MOCK.NOTICE_OF_WORK)
    );
    expect(result).toEqual(expectedValue);
  });
});

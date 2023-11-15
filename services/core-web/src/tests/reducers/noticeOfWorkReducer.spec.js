import { noticeOfWorkReducer } from "@mds/common/redux/reducers/noticeOfWorkReducer";
import {
  storeNoticeOfWorkApplications,
  storeNoticeOfWorkApplication,
  storeNoticeOfWorkApplicationReviews,
} from "@mds/common/redux/actions/noticeOfWorkActions";
import * as MOCK from "@/tests/mocks/noticeOfWorkMocks";

const baseExpectedValue = {
  noticeOfWorkList: [],
  noticeOfWork: {},
  noticeOfWorkPageData: {},
  originalNoticeOfWork: {},
  importNowSubmissionDocumentsJob: {},
  noticeOfWorkReviews: [],
  applicationDelays: [],
  documentDownloadState: { downloading: false, currentFile: 1, totalFiles: 1 },
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

  it("receives STORE_NOTICE_OF_WORK_APPLICATION_REVIEWS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.noticeOfWorkReviews = MOCK.NOTICE_OF_WORK_REVIEW_RESPONSE.records;
    const result = noticeOfWorkReducer(
      undefined,
      storeNoticeOfWorkApplicationReviews(MOCK.NOTICE_OF_WORK_REVIEW_RESPONSE)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_IMPORT_NOTICE_OF_WORK_SUBMISSION_DOCUMENTS_JOB", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.noticeOfWork = MOCK.IMPORT_NOTICE_OF_WORK_SUBMISSION_DOCUMENTS_JOB;
    const result = noticeOfWorkReducer(
      undefined,
      storeNoticeOfWorkApplication(MOCK.IMPORT_NOTICE_OF_WORK_SUBMISSION_DOCUMENTS_JOB)
    );
    expect(result).toEqual(expectedValue);
  });
});

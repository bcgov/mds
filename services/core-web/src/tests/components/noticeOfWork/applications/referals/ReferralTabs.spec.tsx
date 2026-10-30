import React from "react";
import { render } from "@testing-library/react";
import { ReferralTabs } from "@/components/noticeOfWork/applications/referals/ReferralTabs";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const dispatchProps = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  createNoticeOfWorkApplicationReview: jest.fn(),
  fetchNoticeOfWorkApplicationReviews: jest.fn(() => Promise.resolve()),
  updateNoticeOfWorkApplicationReview: jest.fn(),
  deleteNoticeOfWorkApplicationReview: jest.fn(),
  deleteNoticeOfWorkApplicationDocument: jest.fn(),
  updateNoticeOfWorkApplication: jest.fn(),
  setNoticeOfWorkApplicationDocumentDownloadState: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
  fetchNoticeOfWorkReferralPackages: jest.fn(() => Promise.resolve()),
};
const reducerProps = {
  fixedTop: false,
  noticeOfWork: NOW_MOCK.NOTICE_OF_WORK,
  noticeOfWorkReviewTypesHash: {},
  type: "REF",
  importNowSubmissionDocumentsJob: {},
  noticeOfWorkReviewTypes: [],
  noticeOfWorkReviews: [],
};

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
}
describe("ReferralTabs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <ReferralTabs {...dispatchProps} {...reducerProps} />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
    expect(dispatchProps.fetchNoticeOfWorkReferralPackages).toHaveBeenCalledWith(
      NOW_MOCK.NOTICE_OF_WORK.now_application_guid
    );
  });

  it("does not fetch referral packages on mount when type is CON", () => {
    render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <ReferralTabs {...dispatchProps} {...reducerProps} type="CON" />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(dispatchProps.fetchNoticeOfWorkReferralPackages).not.toHaveBeenCalled();
  });

  it("renders properly without fetchNoticeOfWorkReferralPackages prop", () => {
    const { fetchNoticeOfWorkReferralPackages, ...propsWithoutFetch } = dispatchProps;
    render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <ReferralTabs {...propsWithoutFetch} {...reducerProps} />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(propsWithoutFetch.fetchNoticeOfWorkApplicationReviews).toHaveBeenCalled();
  });
});

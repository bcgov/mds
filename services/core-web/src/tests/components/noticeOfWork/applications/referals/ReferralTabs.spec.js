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
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper initialState={initialState}><ReferralTabs {...dispatchProps} {...reducerProps} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});

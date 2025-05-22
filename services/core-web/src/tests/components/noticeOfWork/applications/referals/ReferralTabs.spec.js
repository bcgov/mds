import React from "react";
import { render } from "@testing-library/react";
import { ReferralTabs } from "@/components/noticeOfWork/applications/referals/ReferralTabs";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.createNoticeOfWorkApplicationReview = jest.fn();
  dispatchProps.fetchNoticeOfWorkApplicationReviews = jest.fn(() => Promise.resolve());
  dispatchProps.updateNoticeOfWorkApplicationReview = jest.fn();
  dispatchProps.deleteNoticeOfWorkApplicationReview = jest.fn();
  dispatchProps.deleteNoticeOfWorkApplicationDocument = jest.fn();
  dispatchProps.updateNoticeOfWorkApplication = jest.fn();
  dispatchProps.setNoticeOfWorkApplicationDocumentDownloadState = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.fixedTop = false;
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.noticeOfWorkReviewTypesHash = {};
  reducerProps.type = "REF";
  reducerProps.importNowSubmissionDocumentsJob = {};
  reducerProps.noticeOfWorkReviewTypes = [];
  reducerProps.noticeOfWorkReviews = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

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

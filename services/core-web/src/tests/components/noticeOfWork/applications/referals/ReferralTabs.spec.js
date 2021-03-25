import React from "react";
import { shallow } from "enzyme";
import { ReferralTabs } from "@/components/noticeOfWork/applications/referals/ReferralTabs";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.createNoticeOfWorkApplicationReview = jest.fn();
  dispatchProps.fetchNoticeOfWorkApplicationReviews = jest.fn();
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

describe("ReferralTabs", () => {
  it("renders properly", () => {
    const component = shallow(<ReferralTabs {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});

import React from "react";
import { shallow } from "enzyme";
import { ReferralConsultationPackage } from "@/components/noticeOfWork/applications/referals/ReferralConsultationPackage";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.setNoticeOfWorkApplicationDocumentDownloadState = jest.fn();
  dispatchProps.updateNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.importNowSubmissionDocumentsJob = {};
  reducerProps.progress = "REV";
  reducerProps.type = "REF";
  reducerProps.isTableHeaderView = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("ReferralConsultationPackage", () => {
  it("renders properly", () => {
    const component = shallow(<ReferralConsultationPackage {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});

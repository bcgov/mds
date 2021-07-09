import React from "react";
import { shallow } from "enzyme";
import { ManageDocumentsTab } from "@/components/noticeOfWork/applications/manageDocuments/ManageDocumentsTab";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.updateNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchNoticeOfWorkApplicationReviews = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.inspectors = [];
  reducerProps.importNowSubmissionDocumentsJob = false;
  reducerProps.fixedTop = false;
  reducerProps.formValues = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.noticeOfWorkReviews = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("ManageDocumentsTab", () => {
  it("renders properly", () => {
    const component = shallow(<ManageDocumentsTab {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});

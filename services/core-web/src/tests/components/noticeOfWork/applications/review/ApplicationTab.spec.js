import React from "react";
import { shallow } from "enzyme";
import { ApplicationTab } from "@/components/noticeOfWork/applications/review/ApplicationTab";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.updateNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
  dispatchProps.exportNoticeOfWorkApplicationDocument = jest.fn();
  dispatchProps.reset = jest.fn();
  dispatchProps.submit = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.originalNoticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.importNowSubmissionDocumentsJob = {};
  reducerProps.formValues = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.formErrors = {};
  reducerProps.fixedTop = false;
  reducerProps.submitFailed = false;
  reducerProps.inspectors = [];
  reducerProps.reclamationSummary = [];
  reducerProps.generatableApplicationDocuments = {};
  reducerProps.location = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("ApplicationTab", () => {
  it("renders properly", () => {
    const component = shallow(<ApplicationTab {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});

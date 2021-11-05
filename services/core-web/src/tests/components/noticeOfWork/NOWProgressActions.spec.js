import React from "react";
import { shallow } from "enzyme";
import { NOWProgressActions } from "@/components/noticeOfWork/NOWProgressActions";

const reducerProps = {};
const dispatchProps = {};

const setupReducerProps = () => {
  reducerProps.applicationDelay = {};
  reducerProps.progress = {};
  reducerProps.progressStatusHash = {};
  reducerProps.tab = "application";
  reducerProps.noticeOfWork = { notice_of_work_type_code: "PLA", application_type_code: "NOW" };
  reducerProps.progressStatusHash = {};
  reducerProps.delayTypeOptions = [];
  reducerProps.draftPermitAmendment = {};
  reducerProps.isNoticeOfWorkTypeDisabled = false;
};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.createNoticeOfWorkApplicationProgress = jest.fn();
  dispatchProps.updateNoticeOfWorkApplicationProgress = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
  dispatchProps.updateApplicationDelay = jest.fn();
  dispatchProps.createApplicationDelay = jest.fn();
  dispatchProps.fetchApplicationDelay = jest.fn();
  dispatchProps.handleDraftPermit = jest.fn();
};

beforeEach(() => {
  setupReducerProps();
  setupDispatchProps();
});

describe("NOWProgressActions", () => {
  it("renders properly", () => {
    const component = shallow(<NOWProgressActions {...reducerProps} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});

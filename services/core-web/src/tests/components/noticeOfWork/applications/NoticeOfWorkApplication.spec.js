import React from "react";
import { shallow } from "enzyme";
import { NoticeOfWorkApplication } from "@/components/noticeOfWork/applications/NoticeOfWorkApplication";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchNoticeOfWorkApplicationDocumentTypeOptions = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve());
  dispatchProps.createNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchOriginalNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchNoticeOfWorkActivityTypeOptions = jest.fn();
  dispatchProps.fetchRegionOptions = jest.fn();
  dispatchProps.fetchNoticeOfWorkApplicationTypeOptions = jest.fn();
  dispatchProps.fetchNoticeOfWorkUndergroundExplorationTypeOptions = jest.fn();
  dispatchProps.updateNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchNoticeOfWorkUnitTypeOptions = jest.fn();
  dispatchProps.fetchNoticeOfWorkApplicationPermitTypes = jest.fn();
  dispatchProps.fetchNoticeOfWorkApplicationStatusOptions = jest.fn();
  dispatchProps.fetchNoticeOfWorkApplicationPermitTypes = jest.fn();
  dispatchProps.fetchNoticeOfWorkApplicationProgressStatusCodes = jest.fn();
  dispatchProps.fetchInspectors = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn(() => Promise.resolve());
};

const setupReducerProps = () => {
  reducerProps.match = {};
  reducerProps.history = { push: jest.fn() };
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.formValues = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.reclamationSummary = NOW_MOCK.RECLAMATION_SUMMARY;
  reducerProps.mines = MOCK.MINES;
  reducerProps.location = { state: {} };
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("NoticeOfWorkApplication", () => {
  it("renders properly", () => {
    const component = shallow(
      <NoticeOfWorkApplication {...dispatchProps} {...reducerProps} match={{ params: { id: 1 } }} />
    );
    expect(component).toMatchSnapshot();
  });
});

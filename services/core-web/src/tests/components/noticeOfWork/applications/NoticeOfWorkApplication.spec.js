import React from "react";
import { shallow } from "enzyme";
import { NoticeOfWorkApplication } from "@/components/noticeOfWork/applications/NoticeOfWorkApplication";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve());
  dispatchProps.createNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchOriginalNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchNoticeOFWorkActivityTypeOptions = jest.fn();
  dispatchProps.fetchRegionOptions = jest.fn();
  dispatchProps.fetchNoticeOFWorkApplicationTypeOptions = jest.fn();
  dispatchProps.fetchNoticeOFWorkUndergroundExplorationTypeOptions = jest.fn();
  dispatchProps.updateNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchNoticeOFWorkApplicationPermitTypes = jest.fn();
  dispatchProps.fetchNoticeOFWorkApplicationStatusOptions = jest.fn();
  dispatchProps.fetchNoticeOFWorkApplicationProgressStatusCodes = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn(() => Promise.resolve());
};

const setupReducerProps = () => {
  reducerProps.match = {};
  reducerProps.history = { push: jest.fn() };
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.formValues = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.reclamationSummary = NOW_MOCK.RECLAMATION_SUMMARY;
  reducerProps.mines = MOCK.MINES;
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

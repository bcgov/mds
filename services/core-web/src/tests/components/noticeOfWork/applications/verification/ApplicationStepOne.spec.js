import React from "react";
import { shallow } from "enzyme";
import { ApplicationStepOne } from "@/components/noticeOfWork/applications/verification/ApplicationStepOne";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
  dispatchProps.importNoticeOfWorkApplication = jest.fn();
  dispatchProps.handleUpdateLeadInspector = jest.fn();
  dispatchProps.setLeadInspectorPartyGuid = jest.fn();
  dispatchProps.loadNoticeOfWork = jest.fn();
  dispatchProps.loadMineData = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.inspectors = "";
  reducerProps.initialPermitGuid = "";
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.initialValues = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.inspectors = [];
  reducerProps.originalNoticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  [reducerProps.mineGuid] = MOCK.MINES.mineIds;
  reducerProps.isMajorMine = false;
  reducerProps.isNewApplication = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("ApplicationStepOne", () => {
  it("renders properly", () => {
    const component = shallow(
      <ApplicationStepOne {...dispatchProps} {...reducerProps} match={{ params: { id: 1 } }} />
    );
    expect(component).toMatchSnapshot();
  });
});

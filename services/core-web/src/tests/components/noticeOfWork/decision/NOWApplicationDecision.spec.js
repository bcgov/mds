import React from "react";
import { shallow } from "enzyme";
import { NOWApplicationDecision } from "@/components/noticeOfWork/applications/decision/NOWApplicationDecision";
import * as MOCK from "@/tests/mocks/dataMocks";
import { IMPORTED_NOTICE_OF_WORK } from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchPermits = jest.fn();
  dispatchProps.createNoticeOfWorkApplication = jest.fn(() => Promise.resolve());
};

const setupReducerProps = () => {
  [reducerProps.mineGuid] = MOCK.MINES.mineIds;
  reducerProps.noticeOfWork = IMPORTED_NOTICE_OF_WORK;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("NOWApplicationDecision", () => {
  it("renders properly", () => {
    const component = shallow(<NOWApplicationDecision {...reducerProps} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});

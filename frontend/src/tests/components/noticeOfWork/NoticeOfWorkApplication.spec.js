import React from "react";
import { shallow } from "enzyme";
import { NoticeOfWorkApplication } from "@/components/noticeOfWork/NoticeOfWorkApplication";
import * as MOCK from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchNoticeOfWorkApplication = jest.fn(() => Promise.resolve());
};

const setupReducerProps = () => {
  reducerProps.match = {};
  reducerProps.noticeOfWork = MOCK.NOTICE_OF_WORK;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("PartyProfile", () => {
  it("renders properly", () => {
    const component = shallow(
      <NoticeOfWorkApplication {...dispatchProps} {...reducerProps} match={{ params: { id: 1 } }} />
    );
    expect(component).toMatchSnapshot();
  });
});

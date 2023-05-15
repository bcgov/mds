import React from "react";
import { shallow } from "enzyme";
import { NoticeOfWorkApplication } from "@/components/noticeOfWork/applications/NoticeOfWorkApplication";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps: any = {};
const reducerProps: any = {};

const setupDispatchProps = () => {
  dispatchProps.renderTabTitle = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.match = {};
  reducerProps.history = { push: jest.fn(), location: { state: {} } };
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.applicationPageFromRoute = "mock/url";
  reducerProps.fixedTop = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("NoticeOfWorkApplication", () => {
  it("renders properly", () => {
    const component = shallow(
      <NoticeOfWorkApplication
        {...dispatchProps}
        {...reducerProps}
        match={{ params: { id: 1, tab: "application" } }}
      />
    );
    expect(component).toMatchSnapshot();
  });
});

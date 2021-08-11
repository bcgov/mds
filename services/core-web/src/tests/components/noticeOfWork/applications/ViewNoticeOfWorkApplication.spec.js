import React from "react";
import { shallow } from "enzyme";
import { ViewNoticeOfWorkApplication } from "@/components/noticeOfWork/applications/ViewNoticeOfWorkApplication";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.renderTabTitle = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.applicationPageFromRoute = "mock/url";
  reducerProps.fixedTop = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("ViewNoticeOfWorkApplication", () => {
  it("renders properly", () => {
    const component = shallow(
      <ViewNoticeOfWorkApplication
        {...dispatchProps}
        {...reducerProps}
        match={{ params: { id: 1, tab: "application" } }}
      />
    );
    expect(component).toMatchSnapshot();
  });
});

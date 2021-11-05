import React from "react";
import { shallow } from "enzyme";
import { NoticeOfWorkPageHeader } from "@/components/noticeOfWork/applications/NoticeOfWorkPageHeader";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.renderTabTitle = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.noticeOfWorkApplicationStatusOptionsHash = {};
  reducerProps.inspectorsHash = {};
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.applicationPageFromRoute = "mock/url";
  reducerProps.fixedTop = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("NoticeOfWorkPageHeader", () => {
  it("renders properly", () => {
    const component = shallow(
      <NoticeOfWorkPageHeader
        {...dispatchProps}
        {...reducerProps}
        match={{ params: { id: 1, tab: "application" } }}
      />
    );
    expect(component).toMatchSnapshot();
  });
});
